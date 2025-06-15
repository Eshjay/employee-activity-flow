
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, Info, AlertCircle } from "lucide-react";
import { cleanupAuthState } from "@/hooks/useAuth";
import { checkSessionExpiration, clearExpiredSession } from "@/utils/sessionUtils";

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
      // Clean up existing tokens and log out everywhere before signing in
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (e) {
        // Continue even if this fails
        console.log('Sign out during cleanup failed, continuing...');
      }

      console.log('Attempting to sign in with email:', signInEmail);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        
        // Check if this is a returning user with an expired session
        const wasExpired = await checkSessionExpiration(data.user.id);
        
        if (wasExpired) {
          // Clear the expired session data
          await clearExpiredSession(data.user.id);
          toast({
            title: "Session Renewed",
            description: "Your previous session had expired. You've been signed in with a new 7-day session.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
        
        // Force a page refresh to ensure clean state
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
          For security, your session will automatically expire after 7 days. You'll be prompted to sign in again when this happens.
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
