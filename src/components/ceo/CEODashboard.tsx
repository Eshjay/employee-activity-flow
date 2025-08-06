import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "../shared/DashboardHeader";
import { DailyQuote } from "../shared/DailyQuote";
import { TeamOverviewData } from "./TeamOverviewData";
import { ActivityReports } from "./ActivityReports";
import { EnhancedAnalytics } from "./EnhancedAnalytics";
import { QuickTestReports } from "./QuickTestReports";
import { CEOTaskView } from "./tasks/CEOTaskView";
import { BarChart3, Users, TrendingUp, Calendar, LineChart, TestTube, Briefcase } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useActivities } from "@/hooks/useActivities";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/user";

interface CEODashboardProps {
  user: User;
  onLogout: () => void;
}

export const CEODashboard = ({ user, onLogout }: CEODashboardProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "analytics" | "testing" | "tasks">("overview");
  const { profiles } = useProfiles();
  const { activities } = useActivities();
  const isMobile = useIsMobile();

  // Calculate statistics
  const employees = profiles.filter(p => p.role === 'employee');
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const todaySubmissions = activities.filter(activity => activity.date === today);
  const weeklySubmissions = activities.filter(activity => new Date(activity.date) >= oneWeekAgo);
  
  const activeEmployeeIds = new Set(weeklySubmissions.map(a => a.user_id));
  const activeEmployeesCount = employees.filter(emp => activeEmployeeIds.has(emp.id)).length;

  const stats = [
    { 
      title: "Total Employees", 
      value: employees.length.toString(), 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `${employees.length} registered`,
      trend: "neutral"
    },
    { 
      title: "Today's Submissions", 
      value: todaySubmissions.length.toString(), 
      icon: TrendingUp, 
      color: "text-green-600",
      bgColor: "bg-green-50", 
      change: "+12% from yesterday",
      trend: "up"
    },
    { 
      title: "Weekly Activities", 
      value: weeklySubmissions.length.toString(), 
      icon: BarChart3, 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+8% this week",
      trend: "up"
    },
    { 
      title: "Active Employees", 
      value: `${activeEmployeesCount}/${employees.length}`, 
      icon: Calendar, 
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: `${Math.round((activeEmployeesCount/employees.length) * 100)}% participation`,
      trend: "neutral"
    },
  ];

  const tabs = [
    { key: "overview", label: isMobile ? "Overview" : "Team Overview", icon: Users },
    { key: "reports", label: isMobile ? "Reports" : "Activity Reports", icon: BarChart3 },
    { key: "analytics", label: isMobile ? "Analytics" : "Enhanced Analytics", icon: LineChart },
    { key: "tasks", label: isMobile ? "Tasks" : "Task Management", icon: Briefcase },
    { key: "testing", label: isMobile ? "Testing" : "Quick Testing", icon: TestTube },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-balance">
            Executive Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-pretty">
            Monitor team productivity and activity reports • Real-time insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-fade-in" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 sm:p-3 rounded-lg transition-colors duration-300 ${stat.bgColor} dark:${stat.bgColor.replace('bg-', 'bg-').replace('-50', '-950/20')}`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} dark:${stat.color.replace('text-', 'text-').replace('-600', '-400')}`} />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    stat.trend === 'up' ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-300' : 
                    stat.trend === 'down' ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-300' : 
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isMobile ? stat.change.split(' ')[0] : stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Quote Section */}
        <DailyQuote variant="hero" className="mb-6 sm:mb-8" />

        {/* Tab Navigation */}
        <div className={`mb-6 sm:mb-8 ${isMobile ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap gap-3'}`}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`
                ${isMobile ? 'h-14 p-2 text-xs' : 'flex-1 min-w-[120px] h-12 text-sm'}
                font-medium transition-all duration-200 hover:shadow-md
                ${activeTab === tab.key ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/80 hover:bg-white'}
              `}
            >
              <tab.icon className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-2'} flex-shrink-0`} />
              <span className="truncate">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "overview" && (
            <div className="animate-slide-up">
              <TeamOverviewData />
            </div>
          )}
          {activeTab === "reports" && (
            <div className="animate-slide-up">
              <ActivityReports />
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="animate-slide-up">
              <EnhancedAnalytics />
            </div>
          )}
          {activeTab === "tasks" && (
            <div className="animate-slide-up">
              <CEOTaskView />
            </div>
          )}
          {activeTab === "testing" && (
            <div className="animate-slide-up">
              <QuickTestReports />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
