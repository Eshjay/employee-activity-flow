
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { CEODashboard } from "@/components/ceo/CEODashboard";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";

export type UserRole = "employee" | "ceo" | "developer" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentUser.role === "employee" ? (
        <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
      ) : currentUser.role === "ceo" ? (
        <CEODashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <DeveloperDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
