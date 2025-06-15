
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "../shared/DashboardHeader";
import { UserManagement } from "./UserManagement";
import { DatabaseManagement } from "./DatabaseManagement";
import { SystemSettings } from "./SystemSettings";
import { SystemTester } from "../testing/SystemTester";
import { Users, Database, Settings, TestTube, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/user";

interface DeveloperDashboardProps {
  user: User;
  onLogout: () => void;
}

export const DeveloperDashboard = ({ user, onLogout }: DeveloperDashboardProps) => {
  const [activeTab, setActiveTab] = useState<"users" | "database" | "settings" | "testing">("users");
  const isMobile = useIsMobile();

  const tabs = [
    { key: "users", label: "User Management", icon: Users },
    { key: "database", label: "Database", icon: Database },
    { key: "settings", label: "System Settings", icon: Settings },
    { key: "testing", label: "System Testing", icon: TestTube },
  ];

  const stats = [
    { title: "Developer Mode", value: "Active", icon: BarChart3, color: "text-green-600" },
    { title: "Database Status", value: "Connected", icon: Database, color: "text-blue-600" },
    { title: "User Role", value: user.role, icon: Users, color: "text-purple-600" },
    { title: "System Health", value: "Operational", icon: Settings, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
            Developer Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            System administration and development tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
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
        <div className={`${isMobile ? "flex flex-col gap-2" : "flex gap-4"} mb-4 sm:mb-6`}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`${isMobile ? 'justify-start' : 'flex-1'} h-10 sm:h-12 text-sm sm:text-base`}
              size={isMobile ? "sm" : "default"}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "database" && <DatabaseManagement />}
        {activeTab === "settings" && <SystemSettings />}
        {activeTab === "testing" && <SystemTester />}
      </div>
    </div>
  );
};
