import { NextRequest, NextResponse } from "next/server";
import { getSpendingAlerts } from "@/actions/alerts";

export async function GET(request) {
  try {
    const result = await getSpendingAlerts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in alerts API:", error);
    return NextResponse.json(
      { success: false, error: error.message, alerts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { alertId } = await request.json();
    
    if (!alertId) {
      return NextResponse.json(
        { success: false, error: "Alert ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you'd update the database
    // For now, we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
