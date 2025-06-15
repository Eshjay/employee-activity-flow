
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "../shared/DashboardHeader";
import { TeamOverviewData } from "./TeamOverviewData";
import { ActivityReports } from "./ActivityReports";
import { EnhancedAnalytics } from "./EnhancedAnalytics";
import { QuickTestReports } from "./QuickTestReports";
import { BarChart3, Users, TrendingUp, Calendar, LineChart, TestTube } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useActivities } from "@/hooks/useActivities";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/user";

interface CEODashboardProps {
  user: User;
  onLogout: () => void;
}

export const CEODashboard = ({ user, onLogout }: CEODashboardProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "analytics" | "testing">("overview");
  const { profiles } = useProfiles();
  const { activities } = useActivities();
  const isMobile = useIsMobile();

  // Calculate real statistics
  const employees = profiles.filter(p => p.role === 'employee');
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const todaySubmissions = activities.filter(activity => activity.date === today);
  const weeklySubmissions = activities.filter(activity => new Date(activity.date) >= oneWeekAgo);
  
  // Calculate active employees (those who submitted activities in the last 7 days)
  const activeEmployeeIds = new Set(weeklySubmissions.map(a => a.user_id));
  const activeEmployeesCount = employees.filter(emp => activeEmployeeIds.has(emp.id)).length;

  const stats = [
    { 
      title: "Total Employees", 
      value: employees.length.toString(), 
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "Today's Submissions", 
      value: todaySubmissions.length.toString(), 
      icon: TrendingUp, 
      color: "text-green-600" 
    },
    { 
      title: "Weekly Activities", 
      value: weeklySubmissions.length.toString(), 
      icon: BarChart3, 
      color: "text-purple-600" 
    },
    { 
      title: "Active Employees", 
      value: activeEmployeesCount.toString(), 
      icon: Calendar, 
      color: "text-amber-600" 
    },
  ];

  const tabs = [
    { key: "overview", label: "Team Overview", icon: Users },
    { key: "reports", label: "Activity Reports", icon: BarChart3 },
    { key: "analytics", label: "Enhanced Analytics", icon: LineChart },
    { key: "testing", label: "Quick Testing", icon: TestTube },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
            Executive Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Monitor team productivity and activity reports - Real-time data
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full bg-slate-100 ${stat.color} flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex gap-4'} mb-4 sm:mb-6`}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`${isMobile ? 'justify-start' : 'flex-1'} h-10 sm:h-12 text-sm sm:text-base`}
              size={isMobile ? "sm" : "default"}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {isMobile ? tab.label.replace(" ", "\n") : tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <TeamOverviewData />}
        {activeTab === "reports" && <ActivityReports />}
        {activeTab === "analytics" && <EnhancedAnalytics />}
        {activeTab === "testing" && <QuickTestReports />}
      </div>
    </div>
  );
};
