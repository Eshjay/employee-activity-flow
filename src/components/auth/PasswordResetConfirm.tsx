
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, CheckCircle } from "lucide-react";

export const PasswordResetConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check for Supabase auth hash fragment
        const hashFragment = window.location.hash;
        
        // Handle error cases first
        if (hashFragment.includes('error=')) {
          const urlParams = new URLSearchParams(hashFragment.substring(1));  
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          throw new Error(errorDescription || `Reset failed: ${error}`);
        }
        
        // Handle success case - recovery sessions should have access_token and type=recovery
        if (hashFragment.includes('access_token') && hashFragment.includes('type=recovery')) {
          // User clicked reset link and has valid recovery session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session && session.user) {
            setToken('valid');
            console.log('Valid recovery session found for user:', session.user.email);
          } else {
            throw new Error('No valid recovery session found');
          }
        } else if (hashFragment.includes('access_token')) {
          // This might be a regular login session, redirect to home
          console.log('Regular session detected, redirecting to home');
          navigate('/');
          return;
        } else {
          throw new Error('Invalid reset link - missing required parameters');
        }
      } catch (error) {
        console.error('Password reset validation error:', error);
        toast({
          title: "Invalid reset link",
          description: error.message || "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    checkAuthState();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
      } else {
        setResetComplete(true);
        toast({
          title: "Password reset successful",
          description: "Your password has been updated successfully",
        });
        
        // Clear the hash fragment to clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
          <CardTitle>Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Key className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
