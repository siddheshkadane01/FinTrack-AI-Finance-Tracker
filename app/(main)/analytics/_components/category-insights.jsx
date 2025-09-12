"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getCategoryInsights } from "@/actions/analytics";

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export function CategoryInsights() {
  const [insights, setInsights] = useState([]);
  
  const { loading, fn: fetchInsights, data } = useFetch(getCategoryInsights);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (data?.success) {
      setInsights(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Category Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Category Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No category data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare pie chart data
  const pieData = insights
    .filter(item => item.currentMonth > 0)
    .slice(0, 8)
    .map((item, index) => ({
      name: item.category,
      value: item.currentMonth,
      color: COLORS[index % COLORS.length]
    }));

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend, change) => {
    if (trend === "increasing") return "text-red-600 bg-red-50";
    if (trend === "decreasing") return "text-green-600 bg-green-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-purple-600" />
          Category Deep Dive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Month-over-Month Analysis</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {insights.slice(0, 10).map((item, index) => (
              <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="font-medium capitalize">{item.category}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Last: ₹{item.lastMonth.toFixed(2)}</span>
                      <span>•</span>
                      <span>Current: ₹{item.currentMonth.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend)}
                  <Badge className={getTrendColor(item.trend, item.change)}>
                    {parseFloat(item.change) > 0 ? '+' : ''}{parseFloat(item.change).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-red-600 mb-2">Biggest Increases</h5>
            <div className="space-y-2">
              {insights
                .filter(item => item.trend === "increasing")
                .slice(0, 3)
                .map((item, index) => (
                  <div key={item.category} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{item.category}</span>
                    <span className="font-medium text-red-600">+{parseFloat(item.change).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-green-600 mb-2">Biggest Decreases</h5>
            <div className="space-y-2">
              {insights
                .filter(item => item.trend === "decreasing")
                .slice(0, 3)
                .map((item, index) => (
                  <div key={item.category} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{item.category}</span>
                    <span className="font-medium text-green-600">{parseFloat(item.change).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
