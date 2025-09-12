"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PiggyBank, TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getSavingsRateAnalysis } from "@/actions/analytics";

export function SavingsRateTracker() {
  const [savingsData, setSavingsData] = useState(null);
  
  const { loading, fn: fetchSavingsRate, data } = useFetch(getSavingsRateAnalysis);

  useEffect(() => {
    fetchSavingsRate();
  }, []);

  useEffect(() => {
    if (data?.success) {
      setSavingsData(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Savings Rate Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!savingsData || savingsData.monthlySavings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Savings Rate Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No savings data available.</p>
            <p className="text-sm text-gray-500 mt-2">Start tracking income and expenses to see your savings rate.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = savingsData.monthlySavings.map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    savingsRate: parseFloat(month.savingsRate),
    savings: month.savings,
    income: month.income,
    expense: month.expense
  }));

  const currentSavingsRate = parseFloat(savingsData.averageSavingsRate);
  const targetRate = savingsData.targetSavingsRate || 20;
  
  const getSavingsRateColor = (rate) => {
    if (rate >= 20) return "text-green-600";
    if (rate >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getSavingsRateBg = (rate) => {
    if (rate >= 20) return "bg-green-100";
    if (rate >= 10) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getBenchmarkMessage = (rate) => {
    if (rate >= 20) return "Excellent! You're saving above the recommended 20%";
    if (rate >= 10) return "Good savings rate, aim for 20% for better financial health";
    return "Below recommended rate, consider increasing your savings";
  };

  const getTrendIcon = () => {
    if (savingsData.monthlySavings.length < 2) return null;
    
    const latest = parseFloat(savingsData.monthlySavings[savingsData.monthlySavings.length - 1].savingsRate);
    const previous = parseFloat(savingsData.monthlySavings[savingsData.monthlySavings.length - 2].savingsRate);
    
    if (latest > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (latest < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-600" />
            Savings Rate Tracker
          </CardTitle>
          <Badge className={getSavingsRateBg(currentSavingsRate) + " " + getSavingsRateColor(currentSavingsRate)}>
            {savingsData.trend.charAt(0).toUpperCase() + savingsData.trend.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Savings Rate */}
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Average Savings Rate</h3>
            {getTrendIcon()}
          </div>
          <p className={`text-4xl font-bold ${getSavingsRateColor(currentSavingsRate)}`}>
            {currentSavingsRate}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {getBenchmarkMessage(currentSavingsRate)}
          </p>
        </div>

        {/* Progress towards target */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Progress to Target ({targetRate}%)</span>
            <span className="font-medium">{Math.min(currentSavingsRate, targetRate).toFixed(1)}% / {targetRate}%</span>
          </div>
          <Progress 
            value={Math.min((currentSavingsRate / targetRate) * 100, 100)} 
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            {currentSavingsRate >= targetRate 
              ? `🎉 Target achieved! You're saving ${(currentSavingsRate - targetRate).toFixed(1)}% above target`
              : `${(targetRate - currentSavingsRate).toFixed(1)}% away from target`
            }
          </p>
        </div>

        {/* Savings Trend Chart */}
        <div className="h-48">
          <h4 className="font-medium text-gray-900 mb-3">6-Month Trend</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                domain={[0, 'dataMax + 5']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "savingsRate") return [`${value}%`, "Savings Rate"];
                  return [`₹${value.toFixed(2)}`, name];
                }}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="savingsRate" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="Savings Rate"
              />
              {/* Target line */}
              <Line 
                type="monotone" 
                data={chartData.map(d => ({ ...d, target: targetRate }))}
                dataKey="target" 
                stroke="#6B7280" 
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Monthly Breakdown</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savingsData.monthlySavings.slice(-6).reverse().map((month, index) => {
              const monthRate = parseFloat(month.savingsRate);
              return (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Income: ₹{month.income.toFixed(2)} • Expense: ₹{month.expense.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getSavingsRateColor(monthRate)}`}>
                      {monthRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{month.savings.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            AI Recommendations
          </h4>
          <div className="space-y-2">
            {savingsData.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
          <h5 className="font-medium text-blue-800 mb-1">Benchmark Analysis</h5>
          <p className="text-sm text-blue-700">{savingsData.benchmark}</p>
        </div>
      </CardContent>
    </Card>
  );
}
