"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, AlertTriangle, CheckCircle, TrendingUp, Calendar } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getBudgetVarianceAnalysis } from "@/actions/analytics";

export function BudgetVariance() {
  const [varianceData, setVarianceData] = useState(null);
  
  const { loading, fn: fetchVariance, data } = useFetch(getBudgetVarianceAnalysis);

  useEffect(() => {
    fetchVariance();
  }, []);

  useEffect(() => {
    if (data?.success) {
      setVarianceData(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Budget vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!varianceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Budget vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No budget set for analysis.</p>
            <p className="text-sm text-gray-500 mt-2">Set a monthly budget to track your spending variance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const spentPercentage = (varianceData.actualSpent / varianceData.budget) * 100;
  const projectedPercentage = (parseFloat(varianceData.projectedMonthlySpending) / varianceData.budget) * 100;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getStatusMessage = () => {
    if (varianceData.status === "over_budget") {
      return {
        title: "Over Budget",
        message: `You've exceeded your budget by ₹${Math.abs(varianceData.variance).toFixed(2)}`,
        type: "destructive"
      };
    } else {
      return {
        title: "Under Budget",
        message: `You're ₹${Math.abs(varianceData.variance).toFixed(2)} under budget`,
        type: "default"
      };
    }
  };

  const status = getStatusMessage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Budget Variance Analysis
          </CardTitle>
          <Badge variant={varianceData.status === "over_budget" ? "destructive" : "default"}>
            {varianceData.status === "over_budget" ? "Over Budget" : "Under Budget"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert className={getSeverityColor(varianceData.severity)}>
          <div className="flex items-center gap-2">
            {getSeverityIcon(varianceData.severity)}
            <div>
              <h4 className="font-medium">{status.title}</h4>
              <AlertDescription className="mt-1">
                {status.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Budget Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Spending</span>
            <span className="font-medium">₹{varianceData.actualSpent.toFixed(2)} / ₹{varianceData.budget.toFixed(2)}</span>
          </div>
          <Progress 
            value={Math.min(spentPercentage, 100)} 
            className="w-full"
            style={{
              '--progress-background': spentPercentage > 100 ? '#EF4444' : spentPercentage > 80 ? '#F59E0B' : '#10B981'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>{spentPercentage.toFixed(1)}% used</span>
            <span>100%</span>
          </div>
        </div>

        {/* Projected Spending */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Projected Month-End</span>
            <span className="font-medium">₹{parseFloat(varianceData.projectedMonthlySpending).toFixed(2)}</span>
          </div>
          <Progress 
            value={Math.min(projectedPercentage, 100)} 
            className="w-full opacity-60"
            style={{
              '--progress-background': projectedPercentage > 100 ? '#EF4444' : projectedPercentage > 80 ? '#F59E0B' : '#3B82F6'
            }}
          />
          <p className="text-xs text-gray-500">
            Based on current spending rate of ₹{varianceData.dailySpendingRate}/day
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Days Remaining</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{varianceData.daysRemaining}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">Daily Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">₹{varianceData.dailySpendingRate}</p>
          </div>
        </div>

        {/* Variance Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Variance Breakdown</h4>
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Current Variance</span>
              <span className={`font-medium ${varianceData.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {varianceData.variance >= 0 ? '+' : ''}₹{varianceData.variance.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Projected Variance</span>
              <span className={`font-medium ${parseFloat(varianceData.projectedVariance) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(varianceData.projectedVariance) >= 0 ? '+' : ''}₹{parseFloat(varianceData.projectedVariance).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Variance Percentage</span>
              <span className={`font-medium ${parseFloat(varianceData.variancePercentage) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(varianceData.variancePercentage) >= 0 ? '+' : ''}{varianceData.variancePercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {varianceData.status === "over_budget" && (
          <div className="p-4 border-l-4 border-red-500 bg-red-50">
            <h5 className="font-medium text-red-800 mb-2">Recommendations</h5>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Review and reduce non-essential spending</li>
              <li>• Consider adjusting your budget for next month</li>
              {varianceData.daysRemaining > 0 && (
                <li>• Limit spending to ₹{((varianceData.budget - varianceData.actualSpent) / varianceData.daysRemaining).toFixed(2)}/day for the rest of the month</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
