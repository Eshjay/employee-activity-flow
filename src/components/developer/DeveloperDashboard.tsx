
import { useState } from "react";
import { DashboardHeader } from "../shared/DashboardHeader";
import { MessagingSystemData } from "../shared/MessagingSystemData";
import { DeveloperHeader } from "./dashboard/DeveloperHeader";
import { DeveloperStats } from "./dashboard/DeveloperStats";
import { DeveloperTabNavigation } from "./dashboard/DeveloperTabNavigation";
import { DeveloperTabContent } from "./dashboard/DeveloperTabContent";
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

  const stats = {
    totalEmployees: employeeStats.totalEmployees,
    activeEmployees: employeeStats.activeEmployees,
    departments: employeeStats.departments,
    reportsCount: reports.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DeveloperHeader
          user={user}
          unreadCount={unreadCount}
          onMessagesClick={() => setIsMessagingOpen(true)}
        />

        <DeveloperStats activeTab={activeTab} stats={stats} />

        <DeveloperTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <DeveloperTabContent activeTab={activeTab} onTabChange={setActiveTab} />
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
