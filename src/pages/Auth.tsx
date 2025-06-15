
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SignInForm } from "@/components/auth/SignInForm";
import { DeveloperSignupForm } from "@/components/auth/DeveloperSignupForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { repairAuthDataConsistency } from "@/utils/authRepairUtils";
import { useToast } from "@/hooks/use-toast";
import { Wrench } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [isRepairing, setIsRepairing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading, authError } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleRepairAuth = async () => {
    setIsRepairing(true);
    try {
      const result = await repairAuthDataConsistency();
      if (result.success) {
        toast({
          title: "Auth Repair Complete",
          description: result.message,
        });
        // Force a page refresh to reload auth state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Auth Repair Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Auth Repair Error",
        description: "An unexpected error occurred during repair",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg-light to-brand-bg-dark flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg-light to-brand-bg-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <BrandLogo size={56} className="mb-1 mt-2 drop-shadow-md" />
          <CardTitle className="text-[1.6rem] font-bold text-brand-primary drop-shadow-sm">
            Allure CV Signatures
          </CardTitle>
          <CardDescription className="text-brand-secondary">
            Sign in to your account or create a developer account
          </CardDescription>
          
          {authError && (
            <div className="w-full">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
              <Button
                onClick={handleRepairAuth}
                disabled={isRepairing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Wrench className="w-4 h-4 mr-2" />
                {isRepairing ? "Repairing..." : "Repair Authentication"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="developer-signup">Developer Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            
            <TabsContent value="developer-signup">
              <DeveloperSignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
