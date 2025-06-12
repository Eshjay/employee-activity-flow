
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/pages/Index";
import { DashboardHeader } from "../shared/DashboardHeader";
import { UserManagement } from "./UserManagement";
import { SystemSettings } from "./SystemSettings";
import { Users, Settings, Database, Shield } from "lucide-react";

interface DeveloperDashboardProps {
  user: User;
  onLogout: () => void;
}

export const DeveloperDashboard = ({ user, onLogout }: DeveloperDashboardProps) => {
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");

  const stats = [
    { title: "Total Users", value: "15", icon: Users, color: "text-blue-600" },
    { title: "Active Sessions", value: "8", icon: Shield, color: "text-green-600" },
    { title: "System Health", value: "99%", icon: Database, color: "text-purple-600" },
    { title: "Configurations", value: "24", icon: Settings, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Developer Dashboard
          </h1>
          <p className="text-slate-600">
            System administration and user management
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
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex-1 h-12"
          >
            <Users className="w-4 h-4 mr-2" />
            User Management
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="flex-1 h-12"
          >
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "users" ? <UserManagement /> : <SystemSettings />}
      </div>
    </div>
  );
};
