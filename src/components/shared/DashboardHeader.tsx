
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Building2, Menu } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/user";

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">Activity Tracker</h1>
              <p className="text-xs sm:text-sm text-slate-600">Employee Management System</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-slate-800">Activity Tracker</h1>
            </div>
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Desktop User Info and Actions */}
          <div className={`${isMobile ? 'hidden' : 'flex'} items-center gap-3 sm:gap-4`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role || "employee")}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-slate-800"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  {getRoleBadge(user.role || "employee")}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
