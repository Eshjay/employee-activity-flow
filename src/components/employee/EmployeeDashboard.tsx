import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityForm } from "./ActivityForm";
import { ActivityHistory } from "./ActivityHistory";
import { DashboardHeader } from "../shared/DashboardHeader";
import { CheckCircle, Clock, Calendar } from "lucide-react";
import type { User } from "@/types/user";

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EmployeeDashboard = ({ user, onLogout }: EmployeeDashboardProps) => {
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");

  const handleActivitySubmitted = () => {
    setHasSubmittedToday(true);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasSubmittedToday ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-green-700">Today's Activity Logged</h3>
                      <p className="text-sm text-green-600">Great job! Your daily report has been submitted.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-amber-500" />
                    <div>
                      <h3 className="font-semibold text-amber-700">Daily Activity Pending</h3>
                      <p className="text-sm text-amber-600">Please log your activities for today.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "log" ? "default" : "outline"}
            onClick={() => setActiveTab("log")}
            className="flex-1 h-12"
          >
            Log Activity
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex-1 h-12"
          >
            View History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "log" ? (
          <ActivityForm 
            onSubmitted={handleActivitySubmitted} 
            hasSubmittedToday={hasSubmittedToday}
          />
        ) : (
          <ActivityHistory />
        )}
      </div>
    </div>
  );
};
