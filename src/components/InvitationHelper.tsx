
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailManagement } from "@/hooks/useEmailManagement";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const predefinedUsers = [
  { email: "radeyo@allurecv.com", name: "Radeyo", role: "employee" as const, department: "General" },
  { email: "simisola@allurecv.com", name: "Simisola Akinseye", role: "ceo" as const, department: "Management" },
  { email: "wellness@allurecv.com", name: "Wellness Team", role: "employee" as const, department: "Wellness" },
  { email: "akinwunmi@allurecv.com", name: "Akinwunmi", role: "employee" as const, department: "General" },
  { email: "bukky@allurecv.com", name: "Bukky", role: "employee" as const, department: "General" },
  { email: "concierge@allurecv.com", name: "Concierge Team", role: "employee" as const, department: "Customer Service" },
  { email: "funmi@allurecv.com", name: "Funmi", role: "employee" as const, department: "General" },
  { email: "ifeanyi@allurecv.com", name: "Ifeanyi", role: "employee" as const, department: "General" },
];

export const InvitationHelper = () => {
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { sendUserInvitation } = useEmailManagement();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedUsers.length === predefinedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(predefinedUsers.map(user => user.email));
    }
  };

  const handleSelectUser = (email: string) => {
    setSelectedUsers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSendInvitations = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Unable to determine current user",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to invite",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failureCount = 0;

    for (const email of selectedUsers) {
      const user = predefinedUsers.find(u => u.email === email);
      if (!user) continue;

      try {
        const success = await sendUserInvitation(
          user.email,
          user.name,
          user.role,
          user.department,
          profile.id
        );

        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Failed to send invitation to ${email}:`, error);
        failureCount++;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setLoading(false);

    toast({
      title: "Invitations Sent",
      description: `Successfully sent ${successCount} invitations. ${failureCount} failed.`,
      variant: successCount > 0 ? "default" : "destructive",
    });

    if (successCount > 0) {
      setSelectedUsers([]);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk User Invitation</CardTitle>
        <CardDescription>
          Select users to send invitations to. They will receive an email to complete their registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
            >
              {selectedUsers.length === predefinedUsers.length ? "Deselect All" : "Select All"}
            </Button>
            <Button 
              onClick={handleSendInvitations}
              disabled={loading || selectedUsers.length === 0}
              className="ml-auto"
            >
              {loading ? "Sending..." : `Send Invitations (${selectedUsers.length})`}
            </Button>
          </div>

          <div className="grid gap-2">
            {predefinedUsers.map((user) => (
              <div 
                key={user.email}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectUser(user.email)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.email)}
                  onChange={() => handleSelectUser(user.email)}
                  className="h-4 w-4"
                />
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 capitalize">{user.role} - {user.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
