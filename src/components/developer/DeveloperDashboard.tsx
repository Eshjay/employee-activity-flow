
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "../shared/DashboardHeader";
import { UserManagement } from "./UserManagement";
import { SystemSettings } from "./SystemSettings";
import { RLSTestComponent } from "./RLSTestComponent";
import { DatabaseManagement } from "./DatabaseManagement";
import { MessagingSystemData } from "../shared/MessagingSystemData";
import { 
  Users, 
  Settings, 
  Shield, 
  Database,
  Mail,
  Code,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { useReports } from "@/hooks/useReports";
import type { User } from "@/types/user";

interface DeveloperDashboardProps {
  user: User;
  onLogout: () => void;
}

export const DeveloperDashboard = ({ user, onLogout }: DeveloperDashboardProps) => {
  const { profile } = useAuth();
  const { getUnreadCount } = useMessages(profile?.id);
  const { getEmployeeStats } = useProfiles();
  const { reports } = useReports();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "database" | "settings" | "rls-test">("overview");
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const unreadCount = getUnreadCount();
  const employeeStats = getEmployeeStats();

  const systemStats = [
    {
      label: "Total Users",
      value: employeeStats.totalEmployees,
      icon: Users,
      color: "text-blue-600"
    },
    {
      label: "Active Users",
      value: employeeStats.activeEmployees,
      icon: Activity,
      color: "text-green-600"
    },
    {
      label: "Departments",
      value: employeeStats.departments,
      icon: Code,
      color: "text-purple-600"
    },
    {
      label: "Reports Generated",
      value: reports.length,
      icon: Database,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Developer Dashboard
            </h1>
            <p className="text-slate-600">System administration and development tools</p>
          </div>
          
          {/* Messages Button */}
          <Button
            variant="outline"
            onClick={() => setIsMessagingOpen(true)}
            className="relative flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* System Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Activity className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            User Management
          </Button>
          <Button
            variant={activeTab === "database" ? "default" : "outline"}
            onClick={() => setActiveTab("database")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Database className="w-4 h-4" />
            Database
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant={activeTab === "rls-test" ? "default" : "outline"}
            onClick={() => setActiveTab("rls-test")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Shield className="w-4 h-4" />
            RLS Test
          </Button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "overview" && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">System Overview</h3>
              <p className="text-gray-600 mb-6">
                Welcome to the developer dashboard. Use the tabs above to access different management tools.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setActiveTab("users")} variant="outline">
                  Manage Users
                </Button>
                <Button onClick={() => setActiveTab("database")} variant="outline">
                  Database Tools
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === "users" && <UserManagement />}
          {activeTab === "database" && <DatabaseManagement />}
          {activeTab === "settings" && <SystemSettings />}
          {activeTab === "rls-test" && <RLSTestComponent />}
        </div>
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
