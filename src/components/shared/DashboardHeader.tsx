
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "./ThemeToggle";
import type { User } from "@/types/user";
import { BrandLogo } from "./BrandLogo";

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
    <header className="bg-white dark:bg-slate-950 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-0">
          {/* Brand logo and text */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <BrandLogo size={isMobile ? 36 : 52} className="rounded-lg shadow-soft bg-gradient-to-br from-[#6b7ddb1d] to-[#f5f6fc]" />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-brand-primary">Allure CV Signatures</h1>
              <p className="text-xs sm:text-sm text-brand-secondary">Staff Activity Management</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-brand-primary">Allure CV</h1>
            </div>
          </div>
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {/* Desktop User Info and Actions */}
          <div className={`${isMobile ? "hidden" : "flex"} items-center gap-2 sm:gap-4`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role || "employee")}
                </div>
              </div>
            </div>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 sm:hidden animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                  {getRoleBadge(user.role || "employee")}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
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
