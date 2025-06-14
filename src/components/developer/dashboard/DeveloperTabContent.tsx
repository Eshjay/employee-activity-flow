
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { UserManagement } from "../UserManagement";
import { SystemSettings } from "../SystemSettings";
import { RLSTestComponent } from "../RLSTestComponent";
import { DatabaseManagement } from "../DatabaseManagement";

interface DeveloperTabContentProps {
  activeTab: string;
  onTabChange: (tab: "overview" | "users" | "database" | "settings" | "rls-test") => void;
}

export const DeveloperTabContent = ({ activeTab, onTabChange }: DeveloperTabContentProps) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">System Overview</h3>
            <p className="text-gray-600 mb-6">
              Welcome to the developer dashboard. Use the tabs above to access different management tools.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => onTabChange("users")} variant="outline">
                Manage Users
              </Button>
              <Button onClick={() => onTabChange("database")} variant="outline">
                Database Tools
              </Button>
            </div>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "database":
        return <DatabaseManagement />;
      case "settings":
        return <SystemSettings />;
      case "rls-test":
        return <RLSTestComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {renderTabContent()}
    </div>
  );
};
