
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const SessionExpiryNotification = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('SessionExpiryNotification: Component mounted for authenticated user');

    // Simplified session monitoring - only log visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log('User returned to application');
      }
    };

    // Throttle visibility change events
    let visibilityTimeout: NodeJS.Timeout;
    const throttledVisibilityChange = () => {
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
      visibilityTimeout = setTimeout(handleVisibilityChange, 1000);
    };

    document.addEventListener('visibilitychange', throttledVisibilityChange);

    return () => {
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
      document.removeEventListener('visibilitychange', throttledVisibilityChange);
    };
  }, [isAuthenticated]);

  return null;
};
