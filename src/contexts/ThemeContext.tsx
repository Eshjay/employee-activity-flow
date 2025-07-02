
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Calculate if dark mode should be active
  const calculateIsDark = (currentTheme: ThemeMode) => {
    if (currentTheme === 'system') {
      return getSystemTheme() === 'dark';
    }
    return currentTheme === 'dark';
  };

  // Load user preference from database
  useEffect(() => {
    const loadUserPreference = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('theme_mode')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user preferences:', error);
        }

        const userTheme = data?.theme_mode as ThemeMode || 'system';
        setThemeState(userTheme);
        setIsDark(calculateIsDark(userTheme));
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPreference();
  }, [profile?.id]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDark(calculateIsDark(theme));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setIsDark(calculateIsDark(newTheme));

    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          theme_mode: newTheme
        });

      if (error) {
        console.error('Error saving theme preference:', error);
      }
    } catch (error) {
      console.error('Error updating theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
