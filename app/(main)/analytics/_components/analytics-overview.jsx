"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, AlertTriangle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getAnalyticsData, getBudgetVarianceAnalysis, getSavingsRateAnalysis } from "@/actions/analytics";

export function AnalyticsOverview() {
  const [overviewData, setOverviewData] = useState(null);

  const { loading: analyticsLoading, fn: fetchAnalytics } = useFetch(getAnalyticsData);
  const { loading: budgetLoading, fn: fetchBudgetVariance } = useFetch(getBudgetVarianceAnalysis);
  const { loading: savingsLoading, fn: fetchSavingsRate } = useFetch(getSavingsRateAnalysis);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [analyticsResult, budgetResult, savingsResult] = await Promise.all([
          fetchAnalytics("1month"),
          fetchBudgetVariance(),
          fetchSavingsRate()
        ]);

        if (analyticsResult?.success) {
          const transactions = analyticsResult.data.transactions;
          const currentMonth = {
            income: 0,
            expense: 0,
            transactionCount: transactions.length
          };

          transactions.forEach(t => {
            const amount = t.amount?.toNumber ? t.amount.toNumber() : parseFloat(t.amount);
            if (t.type === "INCOME") {
              currentMonth.income += amount;
            } else {
              currentMonth.expense += amount;
            }
          });

          setOverviewData({
            currentMonth,
            budgetVariance: budgetResult?.success ? budgetResult.data : null,
            savingsRate: savingsResult?.success ? savingsResult.data : null
          });
        }
      } catch (error) {
        console.error("Error loading overview data:", error);
      }
    };

    loadOverviewData();
  }, [fetchAnalytics, fetchBudgetVariance, fetchSavingsRate]);

  const loading = analyticsLoading || budgetLoading || savingsLoading;

  if (loading || !overviewData) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { currentMonth, budgetVariance, savingsRate } = overviewData;
  const netIncome = currentMonth.income - currentMonth.expense;
  const currentSavingsRate = savingsRate?.averageSavingsRate || 0;

  const cards = [
    {
      title: "Monthly Net Income",
      value: `₹${netIncome.toFixed(2)}`,
      icon: netIncome >= 0 ? TrendingUp : TrendingDown,
      trend: netIncome >= 0 ? "positive" : "negative",
      subtitle: `${currentMonth.transactionCount} transactions`,
      color: netIncome >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Total Income",
      value: `₹${currentMonth.income.toFixed(2)}`,
      icon: DollarSign,
      trend: "neutral",
      subtitle: "This month",
      color: "text-blue-600"
    },
    {
      title: "Budget Status",
      value: budgetVariance ? `${budgetVariance.variancePercentage}%` : "No Budget",
      icon: budgetVariance?.status === "over_budget" ? AlertTriangle : Target,
      trend: budgetVariance?.status === "over_budget" ? "negative" : "positive",
      subtitle: budgetVariance ? 
        (budgetVariance.status === "over_budget" ? "Over budget" : "Under budget") : 
        "Set a budget",
      color: budgetVariance?.status === "over_budget" ? "text-red-600" : "text-green-600"
    },
    {
      title: "Savings Rate",
      value: `${currentSavingsRate}%`,
      icon: PiggyBank,
      trend: parseFloat(currentSavingsRate) >= 20 ? "positive" : parseFloat(currentSavingsRate) >= 10 ? "neutral" : "negative",
      subtitle: savingsRate?.trend || "Track savings",
      color: parseFloat(currentSavingsRate) >= 20 ? "text-green-600" : 
             parseFloat(currentSavingsRate) >= 10 ? "text-yellow-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color} mt-1`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  card.trend === "positive" ? "bg-green-100" :
                  card.trend === "negative" ? "bg-red-100" : "bg-blue-100"
                }`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
