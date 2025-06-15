
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { validateAndRefreshSession } from "@/utils/sessionUtils";

export const SessionExpiryNotification = () => {
  const { toast } = useToast();
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session on focus (when user returns to tab)
    const handleFocus = async () => {
      const isValid = await validateAndRefreshSession();
      if (!isValid) {
        toast({
          title: "Session Expired",
          description: "Your session has expired for security. Please sign in again.",
          variant: "destructive",
        });
        await signOut();
      }
    };

    // Check session on visibility change
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        await handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, toast, signOut]);

  return null; // This component doesn't render anything
};
