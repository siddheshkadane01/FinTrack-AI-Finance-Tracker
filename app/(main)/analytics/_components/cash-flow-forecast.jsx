"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Brain, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import useFetch from "@/hooks/use-fetch";
import { getCashFlowForecast } from "@/actions/analytics";

export function CashFlowForecast() {
  const [forecastData, setForecastData] = useState(null);
  
  const { loading, fn: fetchForecast, data } = useFetch(getCashFlowForecast);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  useEffect(() => {
    if (data?.success) {
      setForecastData(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Unable to generate forecast. Need more transaction data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const historicalData = Object.entries(forecastData.historical).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
    type: "Historical"
  }));

  const predictedData = forecastData.predictions.map(pred => ({
    month: pred.month,
    income: pred.predictedIncome,
    expense: pred.predictedExpense,
    net: pred.predictedIncome - pred.predictedExpense,
    type: "Predicted",
    confidence: pred.confidence
  }));

  const chartData = [...historicalData, ...predictedData];

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI-Powered Cash Flow Forecast
          <Badge variant="outline" className="ml-auto">
            Powered by Gemini AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(-2)}`;
                }}
              />
              <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  return `${month}/${year}`;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Income"
                strokeDasharray={(entry) => entry?.type === "Predicted" ? "5 5" : "0"}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Expense"
                strokeDasharray={(entry) => entry?.type === "Predicted" ? "5 5" : "0"}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Net Cash Flow"
                strokeDasharray={(entry) => entry?.type === "Predicted" ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          {forecastData.predictions.map((pred, index) => {
            const netFlow = pred.predictedIncome - pred.predictedExpense;
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{pred.month}</h4>
                  <Badge className={getConfidenceColor(pred.confidence)}>
                    {pred.confidence} confidence
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income:</span>
                    <span className="font-medium text-green-600">₹{pred.predictedIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense:</span>
                    <span className="font-medium text-red-600">₹{pred.predictedExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Flow:</span>
                    <span className={`font-bold flex items-center gap-1 ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netFlow >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      ₹{netFlow.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">AI Insights</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Key Patterns</h5>
              <ul className="space-y-2">
                {forecastData.insights.slice(0, 3).map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Recommendations</h5>
              <ul className="space-y-2">
                {forecastData.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
