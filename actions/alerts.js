"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getSpendingAlerts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get current month transactions
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get previous month transactions for comparison
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [currentMonthTransactions, previousMonthTransactions] = await Promise.all([
      db.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: currentMonthStart, lte: currentMonthEnd },
          type: "EXPENSE"
        },
        orderBy: { date: "desc" }
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: previousMonthStart, lte: previousMonthEnd },
          type: "EXPENSE"
        }
      })
    ]);

    const alerts = [];

    // 1. Category spending comparison alerts
    const categoryAlerts = await generateCategoryAlerts(currentMonthTransactions, previousMonthTransactions);
    alerts.push(...categoryAlerts);

    // 2. Unusual transaction alerts
    const unusualAlerts = await generateUnusualTransactionAlerts(currentMonthTransactions, user.id);
    alerts.push(...unusualAlerts);

    // 3. High spending day alerts
    const highSpendingAlerts = generateHighSpendingAlerts(currentMonthTransactions);
    alerts.push(...highSpendingAlerts);

    return { success: true, alerts };
  } catch (error) {
    console.error("Error getting spending alerts:", error);
    return { success: false, error: error.message, alerts: [] };
  }
}

async function generateCategoryAlerts(currentTransactions, previousTransactions) {
  const alerts = [];

  // Group transactions by category
  const currentByCategory = groupByCategory(currentTransactions);
  const previousByCategory = groupByCategory(previousTransactions);

  for (const [category, currentAmount] of Object.entries(currentByCategory)) {
    const previousAmount = previousByCategory[category] || 0;
    
    if (previousAmount > 0) {
      const percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
      
      if (percentageChange > 30) {
        alerts.push({
          id: `category-${category}-${Date.now()}`,
          type: "spending_increase",
          category,
          message: `You're spending ${percentageChange.toFixed(0)}% more on ${category} this month (₹${currentAmount.toFixed(2)} vs ₹${previousAmount.toFixed(2)})`,
          severity: percentageChange > 50 ? "high" : "medium",
          timestamp: new Date()
        });
      } else if (percentageChange < -30) {
        alerts.push({
          id: `category-savings-${category}-${Date.now()}`,
          type: "spending_decrease",
          category,
          message: `Great! You're spending ${Math.abs(percentageChange).toFixed(0)}% less on ${category} this month`,
          severity: "low",
          timestamp: new Date()
        });
      }
    } else if (currentAmount > 1000) {
      // New spending category
      alerts.push({
        id: `category-new-${category}-${Date.now()}`,
        type: "new_category",
        category,
        message: `New spending detected in ${category}: ₹${currentAmount.toFixed(2)} this month`,
        severity: "medium",
        timestamp: new Date()
      });
    }
  }

  return alerts;
}

async function generateUnusualTransactionAlerts(transactions, userId) {
  const alerts = [];

  if (transactions.length === 0) return alerts;

  // Get user's historical transaction patterns for AI analysis
  const historicalTransactions = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    take: 200
  });

  // Find potentially unusual transactions
  const sortedAmounts = historicalTransactions.map(t => t.amount.toNumber()).sort((a, b) => a - b);
  const q3 = sortedAmounts[Math.floor(sortedAmounts.length * 0.75)];
  const q1 = sortedAmounts[Math.floor(sortedAmounts.length * 0.25)];
  const iqr = q3 - q1;
  const upperBound = q3 + (1.5 * iqr);

  const unusualTransactions = transactions.filter(t => t.amount.toNumber() > upperBound);

  for (const transaction of unusualTransactions.slice(0, 3)) { // Limit to 3 most recent unusual transactions
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Analyze this transaction for unusualness:
      Amount: ₹${transaction.amount}
      Category: ${transaction.category}
      Description: ${transaction.description}
      Date: ${transaction.date.toDateString()}
      
      User's typical spending range: ₹${q1.toFixed(2)} - ₹${q3.toFixed(2)}
      This transaction is ₹${(transaction.amount.toNumber() - q3).toFixed(2)} above typical range.
      
      Provide a brief, helpful alert message about this unusual spending. Keep it under 100 characters.
      Focus on the amount being unusually high for this category.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const alertMessage = response.text().trim();

      alerts.push({
        id: `unusual-${transaction.id}`,
        type: "unusual_transaction",
        transactionId: transaction.id,
        message: alertMessage || `Unusual transaction detected: ₹${transaction.amount} for ${transaction.category}`,
        severity: transaction.amount.toNumber() > upperBound * 2 ? "high" : "medium",
        timestamp: new Date(),
        amount: transaction.amount.toNumber(),
        category: transaction.category
      });
    } catch (error) {
      console.error("Error generating AI alert for transaction:", error);
      // Fallback alert without AI
      alerts.push({
        id: `unusual-${transaction.id}`,
        type: "unusual_transaction",
        transactionId: transaction.id,
        message: `Unusual transaction detected: ₹${transaction.amount} for ${transaction.category}`,
        severity: "medium",
        timestamp: new Date(),
        amount: transaction.amount.toNumber(),
        category: transaction.category
      });
    }
  }

  return alerts;
}

function generateHighSpendingAlerts(transactions) {
  const alerts = [];
  
  // Group transactions by date
  const dailySpending = {};
  transactions.forEach(t => {
    const date = t.date.toDateString();
    dailySpending[date] = (dailySpending[date] || 0) + t.amount.toNumber();
  });

  // Find days with high spending
  const spendingAmounts = Object.values(dailySpending);
  const avgDailySpending = spendingAmounts.reduce((a, b) => a + b, 0) / spendingAmounts.length;
  
  for (const [date, amount] of Object.entries(dailySpending)) {
    if (amount > avgDailySpending * 2.5 && amount > 2000) { // More than 2.5x average and above ₹2000
      alerts.push({
        id: `high-spending-${date}`,
        type: "high_daily_spending",
        message: `High spending day: ₹${amount.toFixed(2)} on ${new Date(date).toLocaleDateString()}`,
        severity: amount > avgDailySpending * 4 ? "high" : "medium",
        timestamp: new Date(),
        date,
        amount
      });
    }
  }

  return alerts.slice(0, 2); // Limit to 2 most recent high spending days
}

function groupByCategory(transactions) {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    acc[category] = (acc[category] || 0) + transaction.amount.toNumber();
    return acc;
  }, {});
}

export async function markAlertAsRead(alertId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // In a real implementation, you'd store read alerts in the database
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error("Error marking alert as read:", error);
    return { success: false, error: error.message };
  }
}
