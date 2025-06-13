
import { useAuth } from "@/hooks/useAuth";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { CEODashboard } from "@/components/ceo/CEODashboard";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";

const Index = () => {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  const user = {
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
