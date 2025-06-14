
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserForm } from "./UserForm";
import type { Profile } from "@/types/user";

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: Partial<Profile> & { role: "employee" | "ceo" | "developer" };
  onUserChange: (user: Partial<Profile> & { role: "employee" | "ceo" | "developer" }) => void;
  onSubmit: () => void;
}

export const AddUserDialog = ({ 
  isOpen, 
  onOpenChange, 
  newUser, 
  onUserChange, 
  onSubmit 
}: AddUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Provide user details. They will need to sign up with the specified email.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={newUser}
          onUserChange={onUserChange}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Send Invitation"
        />
      </DialogContent>
    </Dialog>
  );
};
