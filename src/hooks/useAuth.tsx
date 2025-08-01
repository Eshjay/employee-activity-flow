
import { useSimpleAuth } from './auth/useSimpleAuth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  department: string;
}

// Export cleanup utility for use in other components
export { cleanupAuthState } from './auth/useAuthCleanup';

export const useAuth = () => {
  return useSimpleAuth();
};
