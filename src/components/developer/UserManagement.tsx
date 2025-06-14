
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordDialog } from "../shared/PasswordDialog";
import { useUserManagement } from "@/hooks/useUserManagement";
import { SearchBar } from "./user-management/SearchBar";
import { AddUserDialog } from "./user-management/AddUserDialog";
import { EditUserDialog } from "./user-management/EditUserDialog";
import { UserList } from "./user-management/UserList";
import type { Profile } from "@/types/user";

export const UserManagement = () => {
  const { users, loading, addUser, updateUser, deleteUser } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [passwordDialogUser, setPasswordDialogUser] = useState<Profile | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "employee" as const,
    department: ""
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    const success = await addUser(newUser);
    if (success) {
      setNewUser({ name: "", email: "", role: "employee", department: "" });
      setIsAddUserOpen(false);
    }
  };

  const handleNewUserChange = (user: Partial<Profile> & { role: "employee" | "ceo" | "developer" }) => {
    setNewUser({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      department: user.department || ""
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <AddUserDialog
              isOpen={isAddUserOpen}
              onOpenChange={setIsAddUserOpen}
              newUser={newUser}
              onUserChange={handleNewUserChange}
              onSubmit={handleAddUser}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
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
