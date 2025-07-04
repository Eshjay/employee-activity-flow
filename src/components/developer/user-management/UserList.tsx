
import { Card, CardContent } from "@/components/ui/card";
import { UserCard } from "./UserCard";
import type { Profile } from "@/types/user";

interface UserListProps {
  users: Profile[];
  onEditUser: (user: Profile) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (user: Profile) => void;
}

export const UserList = ({
  users,
  onEditUser,
  onDeleteUser,
  onResetPassword,
}: UserListProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Responsive: vertical space for mobile, tighter for desktop */}
        <div className="flex flex-col divide-y divide-slate-200">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
              onResetPassword={onResetPassword}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
