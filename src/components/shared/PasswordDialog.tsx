
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, Mail } from "lucide-react";

interface PasswordDialogProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordDialog = ({ userId, userName, isOpen, onClose }: PasswordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleSendPasswordReset = async () => {
    setIsLoading(true);

    try {
      // First, get the user's email from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not find user profile');
      }

      console.log('Sending password reset for user:', profile.email);

      // Send password reset email using the correct edge function
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: profile.email
        }
      });

      console.log('Password reset function response:', { data, error });

      if (error) {
        throw error;
      }

      setResetSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: `A password reset link has been sent to ${profile.email}. The user should check their email to complete the reset.`,
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error",
        description: `Failed to send password reset email: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResetSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {resetSent ? <Mail className="w-5 h-5" /> : <Key className="w-5 h-5" />}
            {resetSent ? "Reset Email Sent" : `Reset Password for ${userName}`}
          </DialogTitle>
          <DialogDescription>
            {resetSent 
              ? "The password reset email has been sent successfully."
              : "Send a password reset email to this user's registered email address."
            }
          </DialogDescription>
        </DialogHeader>
        
        {resetSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Password reset email sent successfully. The user will receive instructions to reset their password.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                This will send a password reset email to {userName}'s registered email address. 
                They will receive a secure link to create a new password.
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSendPasswordReset} 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
