
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Settings, 
  Shield, 
  Database,
  Activity
} from "lucide-react";

interface DeveloperTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: "overview" | "users" | "database" | "settings" | "rls-test") => void;
}

export const DeveloperTabNavigation = ({ activeTab, onTabChange }: DeveloperTabNavigationProps) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "User Management", icon: Users },
    { id: "database", label: "Database", icon: Database },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "rls-test", label: "RLS Test", icon: Shield }
  ] as const;

  return (
    <div className="flex gap-4 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "outline"}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};
