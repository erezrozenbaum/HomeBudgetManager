const React = window.React;
const { createContext, useContext, useState, useEffect } = React;
const { ipcRenderer } = require('electron');

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
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

  return React.createElement(
    ThemeContext.Provider,
    { value },
    React.createElement(
      'div',
      { className: `${theme}-theme` },
      children
    )
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

module.exports = { ThemeProvider, useTheme }; 