
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { SignInForm } from "@/components/auth/SignInForm";
import { DeveloperSignupForm } from "@/components/auth/DeveloperSignupForm";
import { BrandLogo } from "@/components/shared/BrandLogo";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

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
