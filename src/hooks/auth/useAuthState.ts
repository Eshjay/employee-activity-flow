
import { useAuthStateManagement } from './useAuthStateManagement';
import { useAuthEventHandlers } from './useAuthEventHandlers';

export const useAuthState = () => {
  const {
    user,
    session,
    profile,
    loading,
    authError,
    setUser,
    setSession,
    setProfile,
    setLoading,
    setAuthError
  } = useAuthStateManagement();

  const { handleAuthStateChange, handleInitialSession } = useAuthEventHandlers();

  const createAuthStateChangeHandler = (mounted: React.MutableRefObject<boolean>) => {
    return async (event: string, session: any) => {
      await handleAuthStateChange(event, session, mounted, {
        setSession,
        setUser,
        setAuthError,
        setProfile,
        setLoading
      });
    };
  };

  const createInitialSessionHandler = (mounted: React.MutableRefObject<boolean>) => {
    return async (session: any) => {
      await handleInitialSession(session, mounted, {
        setSession,
        setUser,
        setProfile,
        setLoading,
        setAuthError
      });
    };
  };

  return {
    user,
    session,
    profile,
    loading,
    authError,
    setUser,
    setSession,
    setProfile,
    setAuthError,
    handleAuthStateChange: createAuthStateChangeHandler,
    handleInitialSession: createInitialSessionHandler
  };
};
