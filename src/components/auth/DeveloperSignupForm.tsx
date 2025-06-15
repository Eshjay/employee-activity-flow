
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, UserPlus, Shield } from "lucide-react";

export const DeveloperSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Developer signup form state (restricted)
  const [developerSignupData, setDeveloperSignupData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    developerKey: ""
  });

  const handleDeveloperSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple developer key validation (you can make this more secure)
    if (developerSignupData.developerKey !== "DEV_ACCESS_2024") {
      toast({
        title: "Access Denied",
        description: "Invalid developer access key.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: developerSignupData.email,
        password: developerSignupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: developerSignupData.name,
            role: "developer",
            department: developerSignupData.department
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Developer account created!",
          description: "Please check your email to verify your account.",
        });
        // Reset form
        setDeveloperSignupData({
          name: "",
          email: "",
          password: "",
          department: "",
          developerKey: ""
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Developer Access Only</span>
        </div>
        <p className="text-xs text-amber-700">
          Developer signup requires a valid access key. Contact your system administrator for access.
        </p>
      </div>
      
      <form onSubmit={handleDeveloperSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dev-access-key">Developer Access Key</Label>
          <Input
            id="dev-access-key"
            type="password"
            value={developerSignupData.developerKey}
            onChange={(e) => setDeveloperSignupData({...developerSignupData, developerKey: e.target.value})}
            placeholder="Enter developer access key"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dev-name">Full Name</Label>
          <Input
            id="dev-name"
            value={developerSignupData.name}
            onChange={(e) => setDeveloperSignupData({...developerSignupData, name: e.target.value})}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dev-email">Email</Label>
          <Input
            id="dev-email"
            type="email"
            value={developerSignupData.email}
            onChange={(e) => setDeveloperSignupData({...developerSignupData, email: e.target.value})}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dev-department">Department</Label>
          <Input
            id="dev-department"
            value={developerSignupData.department}
            onChange={(e) => setDeveloperSignupData({...developerSignupData, department: e.target.value})}
            placeholder="Enter your department (e.g., IT, Development)"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dev-password">Password</Label>
          <div className="relative">
            <Input
              id="dev-password"
              type={showPassword ? "text" : "password"}
              value={developerSignupData.password}
              onChange={(e) => setDeveloperSignupData({...developerSignupData, password: e.target.value})}
              placeholder="Create a password"
              required
              minLength={6}
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
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            "Creating account..."
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Developer Account
            </>
          )}
        </Button>
      </form>
    </>
  );
};
