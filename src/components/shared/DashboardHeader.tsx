
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { LogOut, Building2 } from "lucide-react";

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ceo":
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Executive</Badge>;
      case "developer":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Developer</Badge>;
      case "employee":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Employee</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Activity Tracker</h1>
              <p className="text-sm text-slate-600">Employee Management System</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role || "employee")}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
