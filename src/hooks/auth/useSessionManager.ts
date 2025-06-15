
import { Session } from '@supabase/supabase-js';
import { useProfileManagement } from './useProfileManagement';

export const useSessionManager = () => {
  const { fetchProfile, updateLastLogin } = useProfileManagement();

  const processSession = async (
    session: Session | null,
    mounted: React.MutableRefObject<boolean>,
    setters: {
      setProfile: (profile: any) => void;
      setLoading: (loading: boolean) => void;
      setAuthError: (error: string | null) => void;
    }
  ) => {
    console.log('Processing session - mounted:', mounted.current, 'session user:', session?.user?.id);
    
    if (!mounted.current || !session?.user) {
      console.log('Early return: mounted =', mounted.current, 'has user =', !!session?.user);
      if (mounted.current) {
        setters.setProfile(null);
        setters.setLoading(false);
      }
      return;
    }

    try {
      console.log('Processing session for user:', session.user.id);
      
      // Always ensure loading is set to false, regardless of success or failure
      const profileData = await fetchProfile(session.user.id, session.user.email || '');
      
      if (!mounted.current) {
        console.log('Component unmounted during profile fetch');
        return; // Check if still mounted after async operation
      }
      
      console.log('Profile fetch completed:', profileData ? 'success' : 'failed');
      
      // Set profile (could be null or fallback profile)
      setters.setProfile(profileData);
      setters.setLoading(false);
      setters.setAuthError(null); // Clear any previous errors
      
      if (profileData) {
        // Update last login in background without waiting
        updateLastLogin(session.user.id).catch(error => {
          console.warn('Failed to update last login:', error);
        });
      }
    } catch (error) {
      console.error('Error processing session:', error);
      if (mounted.current) {
        // Set a fallback profile instead of showing error
        const fallbackProfile = {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'employee' as const,
          department: 'General',
        };
        
        console.log('Setting fallback profile due to error');
        setters.setProfile(fallbackProfile);
        setters.setLoading(false);
        setters.setAuthError(null); // Don't show error, use fallback instead
      }
    }
  };

  return { processSession };
};
