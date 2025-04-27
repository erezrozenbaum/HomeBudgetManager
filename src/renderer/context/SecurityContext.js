const React = window.React;
const { createContext, useContext, useState, useEffect } = React;
const { ipcRenderer } = require('electron');

const SecurityContext = createContext();

const SecurityProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const status = await ipcRenderer.invoke('security:checkStatus');
      setIsPasswordProtected(status.passwordProtected);
      setIsEncryptionEnabled(status.encryptionEnabled);
      setIsAuthenticated(status.isAuthenticated);
    } catch (error) {
      console.error('Error checking security status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setPassword = async (password) => {
    try {
      await ipcRenderer.invoke('security:setPassword', password);
      setIsPasswordProtected(true);
      return true;
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  };

  const verifyPassword = async (password) => {
    try {
      const result = await ipcRenderer.invoke('security:verifyPassword', password);
      setIsAuthenticated(result);
      return result;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const setEncryptionKey = async (key) => {
    try {
      await ipcRenderer.invoke('security:setEncryptionKey', key);
      setIsEncryptionEnabled(true);
      return true;
    } catch (error) {
      console.error('Error setting encryption key:', error);
      return false;
    }
  };

  const logAction = async (action, details) => {
    try {
      await ipcRenderer.invoke('security:logAction', { action, details });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const value = {
    isAuthenticated,
    isPasswordProtected,
    isEncryptionEnabled,
    isLoading,
    setPassword,
    verifyPassword,
    setEncryptionKey,
    logAction,
    checkSecurityStatus
  };

  return React.createElement(
    SecurityContext.Provider,
    { value },
    children
  );
};

const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

module.exports = { SecurityProvider, useSecurity }; 