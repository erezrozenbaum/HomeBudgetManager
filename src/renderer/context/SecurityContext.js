const React = require('react');
const { createContext, useContext, useState, useEffect } = React;
const { ipcRenderer } = require('electron');

const SecurityContext = createContext();

const SecurityProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const status = await ipcRenderer.invoke('auth:checkStatus');
      setHasPassword(status.hasPassword);
      setIsAuthenticated(status.isAuthenticated);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking security status:', error);
      setIsLoading(false);
    }
  };

  const setPassword = async (password) => {
    try {
      await ipcRenderer.invoke('auth:setPassword', password);
      await checkSecurityStatus();
      return true;
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  };

  const authenticate = async (password) => {
    try {
      const result = await ipcRenderer.invoke('auth:authenticate', password);
      if (result) {
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Error authenticating:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await ipcRenderer.invoke('auth:logout');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    isAuthenticated,
    hasPassword,
    isLoading,
    setPassword,
    authenticate,
    logout,
    checkSecurityStatus
  };

  return React.createElement(SecurityContext.Provider, { value }, children);
};

const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

module.exports = { SecurityProvider, useSecurity }; 