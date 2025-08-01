import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from './AuthLayout';

export const PasswordResetConfirmFixed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [validToken, setValidToken] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    const checkRecoverySession = () => {
      console.log('PasswordResetConfirm: Checking recovery session');
      console.log('Current hash:', window.location.hash);
      
      // Check if we have an access_token and type=recovery in the URL hash
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      
      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');
      const type = params.get('type');
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      console.log('Hash params:', { accessToken: !!accessToken, tokenType, type, error });
      
      if (error) {
        console.error('Auth error in URL:', error, errorDescription);
        toast({
          title: "Reset Link Error",
          description: errorDescription || "The password reset link is invalid or has expired.",
          variant: "destructive",
        });
        setValidToken('invalid');
        // Redirect to auth page after showing error
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      if (accessToken && type === 'recovery') {
        console.log('Valid recovery token found');
        setValidToken('valid');
      } else {
        console.log('No valid recovery token found');
        setValidToken('invalid');
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        // Redirect to auth page after showing error
        setTimeout(() => navigate('/'), 3000);
      }
    };

    // Check immediately
    checkRecoverySession();
  }, [navigate, toast]);

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
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error updating password",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Password updated successfully');
        setResetComplete(true);
        toast({
          title: "Password updated successfully",
          description: "Your password has been changed. You can now sign in with your new password.",
        });
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear any URL fragments
    window.history.replaceState(null, '', '/');
    navigate('/');
  };

  if (validToken === 'checking') {
    return (
      <AuthLayout title="Validating Reset Link">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center mt-4 text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (validToken === 'invalid') {
    return (
      <AuthLayout title="Invalid Reset Link" description="This password reset link is invalid or has expired.">
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (resetComplete) {
    return (
      <AuthLayout title="Password Updated!" description="Your password has been successfully changed. You can now sign in with your new password.">
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleBackToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password" description="Enter your new password below. Make sure it's at least 6 characters long.">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};