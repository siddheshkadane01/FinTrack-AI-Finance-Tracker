import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowForecast } from "./_components/cash-flow-forecast";
import { ExpenseTrends } from "./_components/expense-trends";
import { CategoryInsights } from "./_components/category-insights";
import { BudgetVariance } from "./_components/budget-variance";
import { SavingsRateTracker } from "./_components/savings-rate-tracker";
import { ReportGenerator } from "./_components/report-generator";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your financial health and spending patterns
          </p>
        </div>
        <ReportGenerator />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-8">
        {/* Cash Flow Forecasting */}
        <Suspense fallback={<CardSkeleton title="Cash Flow Forecast" />}>
          <CashFlowForecast />
        </Suspense>

        {/* Expense Trends and Category Insights */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Suspense fallback={<CardSkeleton title="Expense Trends" />}>
            <ExpenseTrends />
          </Suspense>
          
          <Suspense fallback={<CardSkeleton title="Category Insights" />}>
            <CategoryInsights />
          </Suspense>
        </div>

        {/* Budget Variance and Savings Rate */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Suspense fallback={<CardSkeleton title="Budget vs Actual" />}>
            <BudgetVariance />
          </Suspense>
          
          <Suspense fallback={<CardSkeleton title="Savings Rate" />}>
            <SavingsRateTracker />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function CardSkeleton({ title }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
