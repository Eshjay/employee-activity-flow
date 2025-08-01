
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/hooks/useAuth";
import { SignupWithInvitation } from "./SignupWithInvitation";
import { PasswordResetForm } from "./PasswordResetForm";
import { BrandLogo } from "../shared/BrandLogo";
import { AuthLayout } from "./AuthLayout";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const { toast } = useToast();

  // Check for invitation parameters in URL
  const urlParams = new URLSearchParams(window.location.search);
  const invitationEmail = urlParams.get('email');
  const invitationToken = urlParams.get('token');
  const urlMode = urlParams.get('mode');

  useEffect(() => {
    if (urlMode === 'signup' && invitationEmail && invitationToken) {
      setMode('signup');
      setEmail(invitationEmail);
    }
  }, [urlMode, invitationEmail, invitationToken]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Global sign out warning (continuing):', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Sign in successful, redirecting...');
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Clear URL parameters and redirect
    window.history.replaceState({}, document.title, "/auth");
    window.location.href = "/";
  };

  const handleBackToLogin = () => {
    // Clear URL parameters
    window.history.replaceState({}, document.title, "/auth");
    setMode("signin");
    setEmail("");
    setPassword("");
  };

  if (mode === "signup" && invitationEmail && invitationToken) {
    return (
      <AuthLayout title="Complete Your Registration" description="Set up your account to get started">
        <SignupWithInvitation
          email={invitationEmail}
          token={invitationToken}
          onSuccess={handleSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </AuthLayout>
    );
  }

  if (mode === "reset") {
    return (
      <AuthLayout title="Reset Password" description="Enter your email to receive a password reset link">
        <PasswordResetForm onBackToLogin={() => setMode("signin")} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome Back" description="Sign in to your Activity Tracker account">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("reset")}
                className="text-sm"
              >
                Forgot your password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
