'use client';

import { getAuthToken } from '@/lib/auth';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage or user preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const htmlElement = document.documentElement;
    
    // Always remove dark class first
    htmlElement.classList.remove('dark');
    
    if (savedTheme) {
      setThemeState(savedTheme);
      // Only add dark class if theme is dark
      if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Force remove and add dark class to ensure proper toggling
    const htmlElement = document.documentElement;
    
    // Remove dark class first
    htmlElement.classList.remove('dark');
    
    // Then add it only if theme is dark
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    }

    // Save to backend if user is authenticated
    const token = getAuthToken();
    if (token) {
      axios
        .put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/theme`,
          { theme: newTheme },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .catch((error) => {
          console.error('Failed to save theme preference:', error);
        });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
