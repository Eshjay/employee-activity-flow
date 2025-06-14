
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfiles } from "@/hooks/useProfiles";
import type { Profile } from "@/types/user";

interface UserSelectorProps {
  selectedUserId?: string;
  selectedUserName?: string;
  onUserSelect: (userId: string, userName: string) => void;
  currentUserId: string;
  placeholder?: string;
}

export const UserSelector = ({ 
  selectedUserId, 
  selectedUserName, 
  onUserSelect, 
  currentUserId,
  placeholder = "Select a user..."
}: UserSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { profiles } = useProfiles();

  // Filter out current user and get available recipients
  const availableUsers = profiles.filter(profile => profile.id !== currentUserId);

  const handleUserSelect = (user: Profile) => {
    onUserSelect(user.id, user.name);
    setOpen(false);
  };

  return (
    <div>
      <Label htmlFor="recipient">To:</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUserName ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedUserName}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {availableUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => handleUserSelect(user)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          {user.department}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
