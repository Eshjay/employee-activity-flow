
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import type { User } from "@/types/user";

interface DeveloperHeaderProps {
  user: User;
  unreadCount: number;
  onMessagesClick: () => void;
}

export const DeveloperHeader = ({ user, unreadCount, onMessagesClick }: DeveloperHeaderProps) => {
  return (
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
        onClick={onMessagesClick}
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
  );
};
