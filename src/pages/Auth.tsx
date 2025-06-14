
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, UserPlus, Shield, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Developer signup form state (restricted)
  const [developerSignupData, setDeveloperSignupData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    developerKey: ""
  });

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

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

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Activity Tracker
          </CardTitle>
          <CardDescription>
            Sign in to your account or create a developer account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="developer-signup">Developer Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
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
            </TabsContent>
            
            <TabsContent value="developer-signup">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
