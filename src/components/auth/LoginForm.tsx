
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/pages/Index";
import { Building2, Users } from "lucide-react";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Demo login logic
      const isCEO = email.includes("ceo") || email.includes("admin");
      const isDeveloper = email.includes("dev") || email.includes("admin@");
      
      let role: "employee" | "ceo" | "developer" = "employee";
      let name = "John Smith";
      
      if (isDeveloper) {
        role = "developer";
        name = "Admin User";
      } else if (isCEO) {
        role = "ceo";
        name = "Sarah Johnson";
      }
      
      const user: User = {
        id: "demo-" + Date.now(),
        name,
        email,
        role,
      };
      onLogin(user);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Activity Tracker</h1>
          <p className="text-blue-100 mt-2">Track your daily work activities</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Demo Accounts
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Employee:</strong> employee@company.com</p>
                <p><strong>CEO:</strong> ceo@company.com</p>
                <p><strong>Developer:</strong> admin@company.com</p>
                <p className="text-xs text-blue-600 mt-2">Use any password to login</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
