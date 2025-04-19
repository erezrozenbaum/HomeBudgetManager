import React, { createContext, useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState('light');

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await ipcRenderer.invoke('get-theme');
        const systemTheme = await ipcRenderer.invoke('get-system-theme');
        setTheme(savedTheme || 'light');
        setSystemTheme(systemTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();

    // Listen for system theme changes
    const handleSystemThemeChange = (event, newTheme) => {
      setSystemTheme(newTheme);
    };

    ipcRenderer.on('system-theme-changed', handleSystemThemeChange);

    return () => {
      ipcRenderer.removeListener('system-theme-changed', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await ipcRenderer.invoke('set-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value = {
    theme,
    systemTheme,
    toggleTheme,
    isDarkMode: theme === 'dark',
    isSystemTheme: theme === 'system'
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`${theme}-theme`}>
        {children}
      </div>
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