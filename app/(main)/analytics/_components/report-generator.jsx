"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Calendar, TrendingUp, DollarSign, PieChart } from "lucide-react";
import { toast } from "sonner";

export function ReportGenerator() {
  const [generating, setGenerating] = useState(false);

  const generateReport = async (type, period) => {
    setGenerating(true);
    try {
      toast.loading(`Generating ${type} ${period} report...`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Fetch data based on type and period
      // 2. Generate PDF using a library like jsPDF or Puppeteer
      // 3. Download or email the report
      
      toast.success(`${type} ${period} report generated successfully!`);
      
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Would be actual PDF blob URL
      link.download = `fintrack-${type.toLowerCase()}-${period}-report.pdf`;
      // link.click(); // Uncomment for actual download
      
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Report generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    {
      name: "Complete Financial",
      description: "Comprehensive analysis with all metrics",
      icon: FileText,
      color: "bg-blue-100 text-blue-600"
    },
    {
      name: "Expense Analysis",
      description: "Detailed expense breakdown and trends",
      icon: TrendingUp,
      color: "bg-red-100 text-red-600"
    },
    {
      name: "Income Summary",
      description: "Income tracking and growth analysis",
      icon: DollarSign,
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Category Deep Dive",
      description: "Category-wise spending insights",
      icon: PieChart,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const periods = ["Monthly", "Quarterly", "Yearly"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-medium hover:opacity-90" 
          style={{ backgroundColor: '#2582f5' }}
          disabled={generating}
        >
          <FileText className="w-4 h-4" />
          {generating ? "Generating..." : "Generate Report"}
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30 font-medium">
            PDF
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-gray-900">Financial Reports</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generate comprehensive PDF reports for your financial data
          </p>
        </div>
        
        <div className="p-2">
          {reportTypes.map((reportType) => {
            const IconComponent = reportType.icon;
            return (
              <div key={reportType.name} className="mb-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${reportType.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{reportType.name}</h4>
                    <p className="text-xs text-gray-500">{reportType.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mt-2 ml-11">
                  {periods.map((period) => (
                    <Button
                      key={`${reportType.name}-${period}`}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => generateReport(reportType.name, period)}
                      disabled={generating}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Download className="w-3 h-3" />
            <span>Reports will be downloaded as PDF files</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <Calendar className="w-3 h-3" />
            <span>Data includes up to current date</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
