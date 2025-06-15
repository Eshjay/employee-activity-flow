
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityForm } from "./ActivityForm";
import { ActivityHistoryData } from "./ActivityHistoryData";
import { DashboardHeader } from "../shared/DashboardHeader";
import { MessagingSystemData } from "../shared/MessagingSystemData";
import { CheckCircle, Clock, Calendar, Mail } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"log" | "history" | "messages">("log");
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
    fetchActivities(); // Refresh activities list
  };

  const unreadCount = getUnreadCount();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: isMobile ? "short" : "long",
    year: "numeric",
    month: isMobile ? "short" : "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
                Welcome back, {isMobile ? user.name.split(' ')[0] : user.name}!
              </h1>
              <p className="text-slate-600 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                {today}
              </p>
            </div>
            
            {/* Messages Button */}
            <Button
              variant="outline"
              onClick={() => setIsMessagingOpen(true)}
              className="relative flex items-center gap-2 mt-2 sm:mt-0"
              size={isMobile ? "sm" : "default"}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-4 sm:mb-8 border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {hasSubmittedToday ? (
                  <>
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-700 text-sm sm:text-base">Today's Activity Logged</h3>
                      <p className="text-xs sm:text-sm text-green-600">Great job! Your daily report has been submitted.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-700 text-sm sm:text-base">Daily Activity Pending</h3>
                      <p className="text-xs sm:text-sm text-amber-600">Please log your activities for today.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant={activeTab === "log" ? "default" : "outline"}
            onClick={() => setActiveTab("log")}
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            size={isMobile ? "sm" : "default"}
          >
            Log Activity
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            size={isMobile ? "sm" : "default"}
          >
            View History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "log" ? (
          <ActivityForm />
        ) : (
          <ActivityHistoryData />
        )}
      </div>

      {/* Messaging System */}
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
