
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Key } from "lucide-react";
import type { Profile } from "@/types/user";

interface UserCardProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (user: Profile) => void;
}

export const UserCard = ({ user, onEdit, onDelete, onResetPassword }: UserCardProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ceo":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">CEO</Badge>;
      case "developer":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Developer</Badge>;
      case "employee":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Employee</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>;
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
            {user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-slate-800">{user.name}</h3>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-xs text-slate-500">
            {user.department} • Last login: {user.last_login || 'Never'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {getRoleBadge(user.role)}
        {getStatusBadge(user.status)}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(user)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onResetPassword(user)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Key className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(user.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
