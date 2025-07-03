
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "../shared/DashboardHeader";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-25 via-blue-25 to-slate-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-responsive-2xl font-bold text-slate-800 mb-2 text-balance">
            Executive Dashboard
          </h1>
          <p className="text-responsive-base text-slate-600 text-pretty">
            Monitor team productivity and activity reports • Real-time insights
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-elevated hover:shadow-strong transition-all duration-300 animate-fade-in border-0" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="padding-responsive">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 sm:p-3 rounded-xl ${stat.bgColor} shadow-subtle`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-2xs sm:text-xs font-medium ${
                    stat.trend === 'up' ? 'bg-green-50 text-green-700' : 
                    stat.trend === 'down' ? 'bg-red-50 text-red-700' : 
                    'bg-slate-50 text-slate-600'
                  }`}>
                    {isMobile ? stat.change.split(' ')[0] : stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xs sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-none">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tab Navigation */}
        <div className={`${isMobile ? "grid grid-cols-2 gap-2" : "flex gap-3"} mb-6 sm:mb-8`}>
          {tabs.map((tab, index) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`${isMobile ? "flex-col h-16 p-3" : "flex-1 h-12"} 
                         btn-hover-lift font-medium transition-all duration-200 
                         ${activeTab === tab.key ? 'shadow-medium' : 'shadow-soft'}`}
              size={isMobile ? "sm" : "default"}
            >
              <tab.icon className={`${isMobile ? "w-5 h-5 mb-1" : "w-4 h-4 mr-2"} flex-shrink-0`} />
              <span className={`${isMobile ? "text-2xs" : "text-sm"} font-medium`}>
                {tab.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Enhanced Tab Content */}
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
