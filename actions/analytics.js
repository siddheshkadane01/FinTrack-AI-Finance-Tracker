"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { subDays, subMonths, format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get comprehensive analytics data
export async function getAnalyticsData(timeRange = "6months") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1month":
        startDate = subDays(now, 30);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      case "6months":
        startDate = subMonths(now, 6);
        break;
      case "1year":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6);
    }

    // Fetch all transactions in the time range
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: "asc" },
    });

    // Convert Decimal amounts to numbers
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toNumber()
    }));

    // Get budget data
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    return {
      success: true,
      data: {
        transactions: serializedTransactions,
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        timeRange,
        startDate,
        endDate: now,
      },
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return { success: false, error: error.message };
  }
}

// Cash Flow Forecasting
export async function getCashFlowForecast() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get last 6 months of data
    const sixMonthsAgo = subMonths(new Date(), 6);
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    // Calculate monthly patterns
    const monthlyData = {};
    transactions.forEach((transaction) => {
      const monthKey = format(transaction.date, "yyyy-MM");
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      const amount = transaction.amount.toNumber();
      if (transaction.type === "INCOME") {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
    });

    // Use AI to predict future cash flow
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this financial data and predict the next 3 months cash flow:

Historical Monthly Data:
${Object.entries(monthlyData)
  .map(([month, data]) => `${month}: Income ₹${data.income}, Expense ₹${data.expense}, Net ₹${data.income - data.expense}`)
  .join("\n")}

Provide predictions for the next 3 months in this JSON format:
{
  "predictions": [
    {
      "month": "2025-10",
      "predictedIncome": number,
      "predictedExpense": number,
      "confidence": "high|medium|low",
      "factors": ["list of factors affecting prediction"]
    }
  ],
  "insights": ["key insights about cash flow patterns"],
  "recommendations": ["actionable recommendations"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanedResponse = response.replace(/```(?:json)?\n?/g, "").trim();
    const aiPredictions = JSON.parse(cleanedResponse);

    return {
      success: true,
      data: {
        historical: monthlyData,
        predictions: aiPredictions.predictions,
        insights: aiPredictions.insights,
        recommendations: aiPredictions.recommendations,
      },
    };
  } catch (error) {
    console.error("Error generating cash flow forecast:", error);
    return { success: false, error: error.message };
  }
}

// Expense Trends Analysis
export async function getExpenseTrends(period = "monthly") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    const startDate = period === "yearly" ? subMonths(now, 24) : subMonths(now, 12);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Group by period
    const trendsData = {};
    transactions.forEach((transaction) => {
      const key = period === "yearly" 
        ? format(transaction.date, "yyyy")
        : format(transaction.date, "yyyy-MM");
      
      if (!trendsData[key]) {
        trendsData[key] = { total: 0, categories: {} };
      }
      
      const amount = transaction.amount.toNumber();
      trendsData[key].total += amount;
      
      if (!trendsData[key].categories[transaction.category]) {
        trendsData[key].categories[transaction.category] = 0;
      }
      trendsData[key].categories[transaction.category] += amount;
    });

    // Calculate growth rates
    const periods = Object.keys(trendsData).sort();
    const growthRates = [];
    
    for (let i = 1; i < periods.length; i++) {
      const current = trendsData[periods[i]].total;
      const previous = trendsData[periods[i - 1]].total;
      const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      growthRates.push({
        period: periods[i],
        growthRate: parseFloat(growthRate.toFixed(2)),
        current,
        previous,
      });
    }

    return {
      success: true,
      data: {
        trends: trendsData,
        growthRates,
        period,
      },
    };
  } catch (error) {
    console.error("Error getting expense trends:", error);
    return { success: false, error: error.message };
  }
}

// Category-wise Insights
export async function getCategoryInsights() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Get current and previous month transactions
    const [currentMonthTransactions, lastMonthTransactions] = await Promise.all([
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    // Analyze by category
    const currentCategoryData = groupByCategory(currentMonthTransactions);
    const lastCategoryData = groupByCategory(lastMonthTransactions);

    const categoryInsights = Object.keys({
      ...currentCategoryData,
      ...lastCategoryData,
    }).map((category) => {
      const current = currentCategoryData[category] || 0;
      const last = lastCategoryData[category] || 0;
      const change = last > 0 ? ((current - last) / last) * 100 : current > 0 ? 100 : 0;

      return {
        category,
        currentMonth: current,
        lastMonth: last,
        change: parseFloat(change.toFixed(2)),
        trend: change > 10 ? "increasing" : change < -10 ? "decreasing" : "stable",
      };
    });

    // Sort by current month spending
    categoryInsights.sort((a, b) => b.currentMonth - a.currentMonth);

    return {
      success: true,
      data: categoryInsights,
    };
  } catch (error) {
    console.error("Error getting category insights:", error);
    return { success: false, error: error.message };
  }
}

// Budget vs Actual Analysis
export async function getBudgetVarianceAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    if (!budget) {
      return {
        success: false,
        error: "No budget set",
      };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = monthEnd.getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    // Get current month expenses
    const monthlyExpenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const actualSpent = monthlyExpenses._sum.amount?.toNumber() || 0;
    const budgetAmount = budget.amount.toNumber();
    const variance = actualSpent - budgetAmount;
    const variancePercentage = (variance / budgetAmount) * 100;

    // Calculate daily spending rate
    const dailySpendingRate = actualSpent / daysPassed;
    const projectedMonthlySpending = dailySpendingRate * daysInMonth;
    const projectedVariance = projectedMonthlySpending - budgetAmount;

    return {
      success: true,
      data: {
        budget: budgetAmount,
        actualSpent,
        variance,
        variancePercentage: parseFloat(variancePercentage.toFixed(2)),
        projectedMonthlySpending: parseFloat(projectedMonthlySpending.toFixed(2)),
        projectedVariance: parseFloat(projectedVariance.toFixed(2)),
        dailySpendingRate: parseFloat(dailySpendingRate.toFixed(2)),
        daysRemaining,
        status: variance > 0 ? "over_budget" : "under_budget",
        severity: Math.abs(variancePercentage) > 20 ? "high" : Math.abs(variancePercentage) > 10 ? "medium" : "low",
      },
    };
  } catch (error) {
    console.error("Error getting budget variance analysis:", error);
    return { success: false, error: error.message };
  }
}

// Savings Rate Tracking
export async function getSavingsRateAnalysis() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    const last6Months = subMonths(now, 6);

    // Get last 6 months of data
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: last6Months },
      },
      orderBy: { date: "asc" },
    });

    // Group by month
    const monthlyData = {};
    transactions.forEach((transaction) => {
      const monthKey = format(transaction.date, "yyyy-MM");
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      const amount = transaction.amount.toNumber();
      if (transaction.type === "INCOME") {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
    });

    // Calculate savings rates
    const savingsData = Object.entries(monthlyData).map(([month, data]) => {
      const savings = data.income - data.expense;
      const savingsRate = data.income > 0 ? (savings / data.income) * 100 : 0;
      return {
        month,
        income: data.income,
        expense: data.expense,
        savings,
        savingsRate: parseFloat(savingsRate.toFixed(2)),
      };
    });

    // Calculate average savings rate
    const avgSavingsRate = savingsData.reduce((sum, month) => sum + parseFloat(month.savingsRate), 0) / savingsData.length;

    // Get AI recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this savings data and provide recommendations:

Monthly Savings Data:
${savingsData.map(d => `${d.month}: Income ₹${d.income}, Expense ₹${d.expense}, Savings Rate ${d.savingsRate}%`).join("\n")}

Average Savings Rate: ${avgSavingsRate.toFixed(2)}%

Provide JSON response:
{
  "recommendations": ["specific actionable recommendations"],
  "benchmark": "comparison with standard savings benchmarks",
  "trend": "improving|declining|stable",
  "targetSavingsRate": number
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanedResponse = response.replace(/```(?:json)?\n?/g, "").trim();
    const aiAnalysis = JSON.parse(cleanedResponse);

    return {
      success: true,
      data: {
        monthlySavings: savingsData,
        averageSavingsRate: parseFloat(avgSavingsRate.toFixed(2)),
        recommendations: aiAnalysis.recommendations,
        benchmark: aiAnalysis.benchmark,
        trend: aiAnalysis.trend,
        targetSavingsRate: aiAnalysis.targetSavingsRate,
      },
    };
  } catch (error) {
    console.error("Error getting savings rate analysis:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to group transactions by category
function groupByCategory(transactions) {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    const amount = transaction.amount.toNumber();
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});
}
