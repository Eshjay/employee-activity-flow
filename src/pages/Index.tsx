
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { CEODashboard } from "@/components/ceo/CEODashboard";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";
import type { User } from "@/types/user";

// Export the User type for backward compatibility
export type { User };

const Index = () => {
  const { profile, signOut, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, redirect to auth page
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect via useEffect)
  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  const user: User = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
