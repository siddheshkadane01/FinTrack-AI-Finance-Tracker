"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Parse UPI transaction from SMS/Email text
export async function parseUPITransaction(transactionText) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Use Gemini AI to parse transaction details
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Parse this UPI/bank transaction message and extract the following information in JSON format:
    
    Text: "${transactionText}"
    
    Extract:
    {
      "amount": number (without currency symbol),
      "type": "INCOME" or "EXPENSE",
      "description": "merchant name or transaction description",
      "category": "appropriate category like food, transport, shopping, etc.",
      "date": "YYYY-MM-DD format",
      "upiRef": "UPI reference number if available",
      "bankAccount": "last 4 digits of account if mentioned"
    }
    
    Common patterns to look for:
    - "Rs.500 debited" = EXPENSE
    - "Rs.500 credited" = INCOME
    - "to VPA merchant@paytm" = merchant is "Paytm"
    - "UPI Ref: 123456" = reference number
    - Dates like "12-Sep-25" should be converted to "2025-09-12"
    
    If any information is unclear, make reasonable assumptions. Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const cleanedResponse = response.replace(/```(?:json)?\n?/g, "").trim();
      const parsedData = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsedData.amount || !parsedData.type || !parsedData.description) {
        throw new Error("Missing required transaction data");
      }
      
      return {
        success: true,
        data: {
          ...parsedData,
          amount: parseFloat(parsedData.amount),
          date: new Date(parsedData.date),
          source: "UPI_IMPORT"
        }
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return {
        success: false,
        error: "Could not parse transaction data from text"
      };
    }
  } catch (error) {
    console.error("Error parsing UPI transaction:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Import parsed transaction
export async function importUPITransaction(transactionData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { accounts: { where: { isDefault: true } } }
    });

    if (!user || !user.accounts[0]) {
      throw new Error("No default account found");
    }

    const defaultAccount = user.accounts[0];

    // Check for duplicate transactions
    const existingTransaction = await db.transaction.findFirst({
      where: {
        userId: user.id,
        amount: transactionData.amount,
        description: transactionData.description,
        date: {
          gte: new Date(transactionData.date.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
          lte: new Date(transactionData.date.getTime() + 24 * 60 * 60 * 1000)  // 24 hours after
        }
      }
    });

    if (existingTransaction) {
      return {
        success: false,
        error: "Similar transaction already exists",
        duplicate: true
      };
    }

    // Create the transaction
    const transaction = await db.transaction.create({
      data: {
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description,
        category: transactionData.category,
        date: transactionData.date,
        accountId: defaultAccount.id,
        userId: user.id,
        upiReference: transactionData.upiRef || null,
        source: "UPI_IMPORT"
      }
    });

    return {
      success: true,
      data: transaction
    };
  } catch (error) {
    console.error("Error importing UPI transaction:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Batch process multiple UPI messages
export async function batchImportUPITransactions(transactionTexts) {
  const results = {
    success: 0,
    failed: 0,
    duplicates: 0,
    errors: []
  };

  for (const text of transactionTexts) {
    try {
      const parsed = await parseUPITransaction(text);
      if (parsed.success) {
        const imported = await importUPITransaction(parsed.data);
        if (imported.success) {
          results.success++;
        } else if (imported.duplicate) {
          results.duplicates++;
        } else {
          results.failed++;
          results.errors.push(imported.error);
        }
      } else {
        results.failed++;
        results.errors.push(parsed.error);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(error.message);
    }
  }

  return results;
}
