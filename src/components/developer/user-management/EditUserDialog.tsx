
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import type { Profile } from "@/types/user";

interface EditUserDialogProps {
  editingUser: Profile | null;
  onUserChange: (user: Profile) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const EditUserDialog = ({ 
  editingUser, 
  onUserChange, 
  onSubmit, 
  onClose 
}: EditUserDialogProps) => {
  if (!editingUser) return null;

  return (
    <Dialog open={!!editingUser} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={editingUser}
          onUserChange={onUserChange}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Update User"
          isEditing
        />
      </DialogContent>
    </Dialog>
  );
};
