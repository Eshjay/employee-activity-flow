
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordDialog } from "../shared/PasswordDialog";
import { useUserManagement } from "@/hooks/useUserManagement";
import { SearchBar } from "./user-management/SearchBar";
import { AddUserDialog } from "./user-management/AddUserDialog";
import { EditUserDialog } from "./user-management/EditUserDialog";
import { UserList } from "./user-management/UserList";
import type { Profile } from "@/types/user";

export const UserManagement = () => {
  const { users, loading, addUser, updateUser, deleteUser } =
    useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [passwordDialogUser, setPasswordDialogUser] = useState<Profile | null>(
    null
  );

  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: "employee" | "ceo" | "developer";
    department: string;
  }>({
    name: "",
    email: "",
    role: "employee",
    department: "",
  });

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleAddUser = async () => {
    const success = await addUser(newUser);
    if (success) {
      setNewUser({
        name: "",
        email: "",
        role: "employee",
        department: "",
      });
      setIsAddUserOpen(false);
    }
  };

  const handleNewUserChange = (
    user: Partial<Profile> & { role: "employee" | "ceo" | "developer" }
  ) => {
    setNewUser({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      department: user.department || "",
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const success = await updateUser(editingUser);
    if (success) {
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleResetPassword = (user: Profile) => {
    setPasswordDialogUser(user);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          {/* Responsive header/search: stack on mobile, inline on desktop */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions ({users.length} total users)
              </CardDescription>
            </div>
            {/* Mobile: button below, Desktop: right */}
            <div className="flex gap-2 flex-col sm:flex-row sm:gap-4 w-full sm:w-auto">
              <AddUserDialog
                isOpen={isAddUserOpen}
                onOpenChange={setIsAddUserOpen}
                newUser={newUser}
                onUserChange={handleNewUserChange}
                onSubmit={handleAddUser}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Responsive search bar: full width on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-slate-600 mt-2">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </CardContent>
      </Card>

      <UserList
        users={filteredUsers}
        onEditUser={setEditingUser}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
      />

      <EditUserDialog
        editingUser={editingUser}
        onUserChange={setEditingUser}
        onSubmit={handleUpdateUser}
        onClose={() => setEditingUser(null)}
      />

      {passwordDialogUser && (
        <PasswordDialog
          userId={passwordDialogUser.id}
          userName={passwordDialogUser.name}
          isOpen={!!passwordDialogUser}
          onClose={() => setPasswordDialogUser(null)}
        />
      )}
    </div>
  );
};
