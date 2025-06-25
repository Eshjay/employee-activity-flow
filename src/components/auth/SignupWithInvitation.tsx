
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmailManagement } from "@/hooks/useEmailManagement";
import { CheckCircle, AlertCircle } from "lucide-react";

interface SignupWithInvitationProps {
  email: string;
  token: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const SignupWithInvitation = ({ 
  email, 
  token, 
  onSuccess, 
  onBackToLogin 
}: SignupWithInvitationProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [invitationData, setInvitationData] = useState<any>(null);
  const { toast } = useToast();
  const { verifyInvitation } = useEmailManagement();

  useEffect(() => {
    const checkInvitation = async () => {
      setVerifying(true);
      try {
        console.log('Checking invitation for:', { email, token: token?.substring(0, 8) + '...' });
        
        const result = await verifyInvitation(token, email);
        
        if (result.valid) {
          setInvitationValid(true);
          setInvitationData(result.invitation);
          console.log('Invitation verified successfully');
        } else {
          setInvitationValid(false);
          setInvitationError(result.error || 'Invalid invitation');
          console.log('Invitation verification failed:', result.error);
        }
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setInvitationValid(false);
        setInvitationError('Failed to verify invitation');
      } finally {
        setVerifying(false);
      }
    };

    if (token && email) {
      checkInvitation();
    }
  }, [token, email, verifyInvitation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting signup process for:', email);
      
      // First, mark the invitation as used
      const { error: markUsedError } = await supabase
        .from('email_invitations')
        .update({ 
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('invitation_token', token)
        .eq('email', email);

      if (markUsedError) {
        console.error('Error marking invitation as used:', markUsedError);
        // Continue with signup even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            invitation_token: token,
            invitation_used: true
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        // If user already exists, try to sign them in instead
        if (error.message?.includes('already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Try signing in instead.",
            variant: "destructive",
          });
          onBackToLogin();
          return;
        }
        
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Signup successful:', data.user.id);
        
        toast({
          title: "Account created successfully",
          description: "Welcome! You can now start using the system.",
        });
        
        // Short delay to ensure auth state is updated
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Verifying Invitation</CardTitle>
          <CardDescription>
            Please wait while we verify your invitation...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!invitationValid) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            {invitationError || 'This invitation link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onBackToLogin}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
        <CardTitle>Complete Your Registration</CardTitle>
        <CardDescription>
          Create your password to access Activity Tracker
        </CardDescription>
        <div className="text-sm text-gray-600 mt-2">
          Email: <strong>{email}</strong>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            onClick={onBackToLogin}
            className="w-full"
            disabled={loading}
          >
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
