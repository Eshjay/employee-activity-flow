
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { CEODashboard } from "@/components/ceo/CEODashboard";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";
import { SessionExpiryNotification } from "@/components/shared/SessionExpiryNotification";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { User } from "@/types/user";

export type { User };

const Index = () => {
  const { profile, signOut, loading, isAuthenticated, authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: Auth state changed', {
      loading,
      isAuthenticated,
      hasProfile: !!profile,
      authError
    });

    // Only redirect if not loading and definitely not authenticated
    if (!loading && !isAuthenticated && !authError) {
      console.log('Index: Redirecting to auth page');
      navigate("/auth", { replace: true }); // Use replace to prevent back button issues
    }
  }, [loading, isAuthenticated, navigate, authError, profile]);

  // Early return for loading state
  if (loading) {
    console.log('Index: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Early return for auth error state
  if (authError) {
    console.log('Index: Showing auth error state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{authError}</p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Early return for unauthenticated state
  if (!isAuthenticated || !profile) {
    console.log('Index: Not authenticated, showing redirect message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  console.log('Index: Rendering dashboard for user role:', profile.role);

  const user: User = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SessionExpiryNotification />
      {profile.role === "employee" ? (
        <EmployeeDashboard user={user} onLogout={signOut} />
      ) : profile.role === "ceo" ? (
        <CEODashboard user={user} onLogout={signOut} />
      ) : (
        <DeveloperDashboard user={user} onLogout={signOut} />
      )}
    </div>
  );
};

export default Index;
