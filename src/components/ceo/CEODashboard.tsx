
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/pages/Index";
import { DashboardHeader } from "../shared/DashboardHeader";
import { TeamOverview } from "./TeamOverview";
import { ActivityReports } from "./ActivityReports";
import { BarChart3, Users, TrendingUp, Calendar } from "lucide-react";

interface CEODashboardProps {
  user: User;
  onLogout: () => void;
}

export const CEODashboard = ({ user, onLogout }: CEODashboardProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "reports">("overview");

  const stats = [
    { title: "Total Employees", value: "12", icon: Users, color: "text-blue-600" },
    { title: "Today's Submissions", value: "9", icon: TrendingUp, color: "text-green-600" },
    { title: "Weekly Reports", value: "47", icon: BarChart3, color: "text-purple-600" },
    { title: "Pending Activities", value: "3", icon: Calendar, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Executive Dashboard
          </h1>
          <p className="text-slate-600">
            Monitor team productivity and activity reports
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex-1 h-12"
          >
            <Users className="w-4 h-4 mr-2" />
            Team Overview
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "outline"}
            onClick={() => setActiveTab("reports")}
            className="flex-1 h-12"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Activity Reports
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" ? <TeamOverview /> : <ActivityReports />}
      </div>
    </div>
  );
};
