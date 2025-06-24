
import { Button } from "@/components/ui/button";
import { Users, Settings, Database, Mail } from "lucide-react";

interface DeveloperTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DeveloperTabNavigation = ({ 
  activeTab, 
  onTabChange 
}: DeveloperTabNavigationProps) => {
  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "email", label: "Email", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "database", label: "Database", icon: Database },
  ];

  return (
    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
