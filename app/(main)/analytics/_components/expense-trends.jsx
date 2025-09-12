"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getExpenseTrends } from "@/actions/analytics";

export function ExpenseTrends() {
  const [trendsData, setTrendsData] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [viewType, setViewType] = useState("bar"); // bar or line
  
  const { loading, fn: fetchTrends, data } = useFetch(getExpenseTrends);

  useEffect(() => {
    fetchTrends(period);
  }, [period, fetchTrends]);

  useEffect(() => {
    if (data?.success) {
      setTrendsData(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Expense Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Expense Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No expense data available for trends analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(trendsData.trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, data]) => ({
      period: periodKey,
      total: data.total,
      displayPeriod: period === "yearly" ? periodKey : 
        new Date(periodKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }));

  // Calculate overall trend
  const totalTrend = trendsData.growthRates.length > 0 ? 
    trendsData.growthRates.reduce((sum, rate) => sum + parseFloat(rate.growthRate), 0) / trendsData.growthRates.length : 0;

  // Get top categories for current period
  const latestPeriod = chartData[chartData.length - 1];
  const latestPeriodData = latestPeriod ? trendsData.trends[latestPeriod.period] : null;
  const topCategories = latestPeriodData ? 
    Object.entries(latestPeriodData.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Expense Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={period === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Growth</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
              totalTrend >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {totalTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(totalTrend).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Data Points</p>
            <p className="text-lg font-bold text-blue-600">{chartData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Latest Period</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{latestPeriod ? latestPeriod.total.toFixed(0) : '0'}
            </p>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("bar")}
          >
            Bar Chart
          </Button>
          <Button
            variant={viewType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("line")}
          >
            Line Chart
          </Button>
        </div>

        {/* Main Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayPeriod" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toFixed(2)}`, "Expenses"]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Bar 
                  dataKey="total" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayPeriod"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toFixed(2)}`, "Expenses"]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Growth Rates */}
        {trendsData.growthRates.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Growth Rates</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {trendsData.growthRates.slice(-6).map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {period === "yearly" ? rate.period : 
                      new Date(rate.period + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                    }
                  </span>
                  <Badge 
                    variant={parseFloat(rate.growthRate) > 0 ? "destructive" : "default"}
                    className={parseFloat(rate.growthRate) > 0 ? "" : "bg-green-100 text-green-800"}
                  >
                    {parseFloat(rate.growthRate) > 0 ? '+' : ''}{rate.growthRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Top Categories {period === "yearly" ? "This Year" : "This Month"}
            </h4>
            <div className="space-y-2">
              {topCategories.map(([category, amount], index) => {
                const percentage = latestPeriodData ? (amount / latestPeriodData.total) * 100 : 0;
                return (
                  <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
