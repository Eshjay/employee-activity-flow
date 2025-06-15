
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, Info, AlertCircle } from "lucide-react";
import { cleanupAuthState } from "@/hooks/useAuth";

export const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting sign in process for:', signInEmail);

      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: "global" });
        console.log('Cleared existing sessions');
      } catch (e) {
        console.log('No existing session to clear, continuing...');
      }

      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (authError) {
        throw authError;
      }

      if (data.user && data.session) {
        console.log('Sign in successful for user:', data.user.id);
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        // Wait for auth state to propagate, then redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = "An error occurred during sign in.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={signInEmail}
          onChange={(e) => setSignInEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            value={signInPassword}
            onChange={(e) => setSignInPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Session Security</span>
        </div>
        <p className="text-xs text-blue-700">
          Your session will remain active and secure. You'll only need to sign in again if you explicitly log out or after extended periods of inactivity.
        </p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
};
