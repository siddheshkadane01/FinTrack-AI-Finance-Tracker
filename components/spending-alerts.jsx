"use client";

import { useState, useEffect } from "react";
import { Bell, X, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useFetch from "@/hooks/use-fetch";
import { getSpendingAlerts, markAlertAsRead } from "@/actions/alerts";

export function SpendingAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readAlerts, setReadAlerts] = useState(new Set());

  const {
    loading,
    fn: fetchAlerts,
    data: alertsData,
  } = useFetch(getSpendingAlerts);

  const {
    fn: markAsRead,
  } = useFetch(markAlertAsRead);

  useEffect(() => {
    fetchAlerts();
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    if (alertsData?.success && alertsData.alerts) {
      setAlerts(alertsData.alerts);
      
      // Calculate unread count
      const unread = alertsData.alerts.filter(alert => !readAlerts.has(alert.id)).length;
      setUnreadCount(unread);
    }
  }, [alertsData, readAlerts]);

  const handleMarkAsRead = async (alertId) => {
    await markAsRead(alertId);
    setReadAlerts(prev => new Set([...prev, alertId]));
  };

  const clearAllAlerts = () => {
    const allAlertIds = alerts.map(alert => alert.id);
    setReadAlerts(new Set(allAlertIds));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "spending_increase":
      case "high_daily_spending":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "unusual_transaction":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "spending_decrease":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "new_category":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-orange-500 bg-orange-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const visibleAlerts = alerts.filter(alert => !readAlerts.has(alert.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-hidden p-0"
      >
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Spending Alerts</h3>
            {visibleAlerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAlerts}
                className="text-white hover:bg-white/20 h-auto py-1 px-2"
              >
                Clear all
              </Button>
            )}
          </div>
          <p className="text-sm text-blue-100 mt-1">
            {visibleAlerts.length === 0 
              ? "No new alerts" 
              : `${visibleAlerts.length} new alert${visibleAlerts.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-6 h-6 mx-auto mb-2 animate-pulse" />
              Loading alerts...
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No new spending alerts</p>
              <p className="text-xs text-gray-400 mt-1">
                We&apos;ll notify you of any unusual spending patterns
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {visibleAlerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {visibleAlerts.length > 10 && (
                <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                  +{visibleAlerts.length - 10} more alerts
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-gray-50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-gray-600 hover:text-gray-800"
            onClick={fetchAlerts}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh alerts"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
