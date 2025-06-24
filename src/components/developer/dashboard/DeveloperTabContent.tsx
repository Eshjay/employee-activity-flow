
import { UserManagement } from "../UserManagement";
import { SystemSettings } from "../SystemSettings";
import { DatabaseManagement } from "../DatabaseManagement";
import { EmailManagement } from "../EmailManagement";

interface DeveloperTabContentProps {
  activeTab: string;
}

export const DeveloperTabContent = ({ activeTab }: DeveloperTabContentProps) => {
  switch (activeTab) {
    case "users":
      return <UserManagement />;
    case "settings":
      return <SystemSettings />;
    case "database":
      return <DatabaseManagement />;
    case "email":
      return <EmailManagement />;
    default:
      return <UserManagement />;
  }
};
