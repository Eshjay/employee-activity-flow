
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityForm } from "./ActivityForm";
import { ActivityHistoryData } from "./ActivityHistoryData";
import { DashboardHeader } from "../shared/DashboardHeader";
import { MessagingSystemData } from "../shared/MessagingSystemData";
import { DailyQuote } from "../shared/DailyQuote";
import { TodoManagement } from "../todos/TodoManagement";
import { TaskManagement } from "../tasks/TaskManagement";
import { CheckCircle, Clock, Calendar, Mail, TrendingUp, CheckSquare, Briefcase } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/user";

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EmployeeDashboard = ({ user, onLogout }: EmployeeDashboardProps) => {
  const { profile } = useAuth();
  const { activities, fetchActivities } = useActivities();
  const { getUnreadCount } = useMessages(profile?.id);
  const [activeTab, setActiveTab] = useState<"log" | "history" | "todos" | "tasks">("log");
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check if user has submitted today
  useEffect(() => {
    if (profile?.id && activities.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todaySubmission = activities.find(activity => 
        activity.user_id === profile.id && activity.date === today
      );
      setHasSubmittedToday(!!todaySubmission);
    }
  }, [profile?.id, activities]);

  const handleActivitySubmitted = () => {
    setHasSubmittedToday(true);
    fetchActivities();
  };

  const unreadCount = getUnreadCount();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: isMobile ? "short" : "long",
    year: "numeric",
    month: isMobile ? "short" : "long",
    day: "numeric"
  });

  // Calculate user stats
  const userActivities = activities.filter(a => a.user_id === profile?.id);
  const thisWeekActivities = userActivities.filter(a => {
    const activityDate = new Date(a.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return activityDate >= weekStart;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-responsive-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-balance">
                Welcome back, {isMobile ? user.name.split(' ')[0] : user.name}! 👋
              </h1>
              <div className="flex items-center gap-2 text-responsive-base text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>{today}</span>
              </div>
            </div>
            
            {/* Enhanced Messages Button */}
            <Button
              variant="outline"
              onClick={() => setIsMessagingOpen(true)}
              className="relative btn-hover-lift shadow-soft border-slate-200 font-medium"
              size={isMobile ? "sm" : "default"}
            >
              <Mail className="w-4 h-4 mr-2" />
              <span className={isMobile ? "" : "mr-1"}>Messages</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-bounce-subtle">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Status Card */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-medium hover:shadow-strong transition-all duration-300 animate-fade-in">
          <CardContent className="padding-responsive">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 sm:p-4 rounded-2xl shadow-soft transition-colors duration-300 ${hasSubmittedToday ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                  {hasSubmittedToday ? (
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 dark:text-green-400" />
                  ) : (
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-responsive-lg font-bold mb-1 transition-colors duration-300 ${hasSubmittedToday ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {hasSubmittedToday ? "Today's Activity Logged ✓" : "Daily Activity Pending"}
                  </h3>
                  <p className={`text-responsive-sm transition-colors duration-300 ${hasSubmittedToday ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {hasSubmittedToday 
                      ? "Great job! Your daily report has been submitted successfully." 
                      : "Please log your activities for today to stay on track."
                    }
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="flex gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">{userActivities.length}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Total Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">{thisWeekActivities.length}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">This Week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quote Section */}
        <DailyQuote className="mb-6 sm:mb-8" />

        {/* Enhanced Tab Navigation */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto">
          <Button
            variant={activeTab === "log" ? "default" : "outline"}
            onClick={() => setActiveTab("log")}
            className="flex-shrink-0 h-12 sm:h-14 btn-hover-lift font-medium shadow-soft transition-all duration-200"
            size={isMobile ? "sm" : "default"}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="text-responsive-sm">Log Activity</span>
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex-shrink-0 h-12 sm:h-14 btn-hover-lift font-medium shadow-soft transition-all duration-200"
            size={isMobile ? "sm" : "default"}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-responsive-sm">History</span>
          </Button>
          <Button
            variant={activeTab === "todos" ? "default" : "outline"}
            onClick={() => setActiveTab("todos")}
            className="flex-shrink-0 h-12 sm:h-14 btn-hover-lift font-medium shadow-soft transition-all duration-200"
            size={isMobile ? "sm" : "default"}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            <span className="text-responsive-sm">Todos</span>
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "outline"}
            onClick={() => setActiveTab("tasks")}
            className="flex-shrink-0 h-12 sm:h-14 btn-hover-lift font-medium shadow-soft transition-all duration-200"
            size={isMobile ? "sm" : "default"}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-responsive-sm">Tasks</span>
          </Button>
        </div>

        {/* Enhanced Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "log" && (
            <div className="animate-slide-up">
              <ActivityForm />
            </div>
          )}
          {activeTab === "history" && (
            <div className="animate-slide-up">
              <ActivityHistoryData />
            </div>
          )}
          {activeTab === "todos" && (
            <div className="animate-slide-up">
              <TodoManagement />
            </div>
          )}
          {activeTab === "tasks" && (
            <div className="animate-slide-up">
              <TaskManagement />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Messaging System */}
      {profile?.id && (
        <MessagingSystemData
          currentUserId={profile.id}
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </div>
  );
};
