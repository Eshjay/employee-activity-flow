
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const SessionExpiryNotification = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Simplified session check on visibility change only
    const handleVisibilityChange = async () => {
      if (!document.hidden && isAuthenticated) {
        // Just log that user returned to the app
        console.log('User returned to application');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, toast]);

  return null; // This component doesn't render anything
};
