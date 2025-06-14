
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/types/user";

interface UserFormProps {
  user: Partial<Profile> & { role: "employee" | "ceo" | "developer" };
  onUserChange: (user: Partial<Profile> & { role: "employee" | "ceo" | "developer" }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isEditing?: boolean;
}

export const UserForm = ({ 
  user, 
  onUserChange, 
  onSubmit, 
  onCancel, 
  submitLabel,
  isEditing = false 
}: UserFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={isEditing ? "edit-name" : "name"}>Full Name</Label>
        <Input
          id={isEditing ? "edit-name" : "name"}
          value={user.name || ""}
          onChange={(e) => onUserChange({...user, name: e.target.value})}
          placeholder="Enter full name"
        />
      </div>
      <div>
        <Label htmlFor={isEditing ? "edit-email" : "email"}>Email</Label>
        <Input
          id={isEditing ? "edit-email" : "email"}
          type="email"
          value={user.email || ""}
          onChange={(e) => onUserChange({...user, email: e.target.value})}
          placeholder="Enter email address"
        />
      </div>
      <div>
        <Label htmlFor={isEditing ? "edit-role" : "role"}>Role</Label>
        <Select 
          value={user.role} 
          onValueChange={(value: "employee" | "ceo" | "developer") => onUserChange({...user, role: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="ceo">CEO</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={isEditing ? "edit-department" : "department"}>Department</Label>
        <Input
          id={isEditing ? "edit-department" : "department"}
          value={user.department || ""}
          onChange={(e) => onUserChange({...user, department: e.target.value})}
          placeholder="Enter department"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={onSubmit} className="flex-1">{submitLabel}</Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  );
};
