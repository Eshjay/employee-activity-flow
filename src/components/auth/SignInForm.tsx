
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, Info } from "lucide-react";
import { updateLastLogin } from "@/utils/authUtils";

export const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      if (data.user) {
        // Update last login timestamp
        await updateLastLogin(data.user.id);
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={signInEmail}
          onChange={(e) => setSignInEmail(e.target.value)}
          placeholder="Enter your email"
          required
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
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Information about account access */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Employee Access</span>
        </div>
        <p className="text-xs text-blue-700">
          Existing employees can sign in with their provided credentials. New employee accounts are created by administrators.
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
