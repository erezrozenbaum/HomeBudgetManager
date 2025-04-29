const React = require('react');
const { createContext, useContext, useState, useEffect } = React;
const { ipcRenderer } = require('electron');

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const status = await ipcRenderer.invoke('auth:checkStatus');
      setIsPasswordProtected(status.isPasswordProtected);
      setIsEncryptionEnabled(status.isEncryptionEnabled);
      setIsAuthenticated(status.isAuthenticated);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking security status:', error);
      setIsLoading(false);
    }
  };

  const setPassword = async (password) => {
    try {
      const result = await ipcRenderer.invoke('auth:setPassword', password);
      if (result) {
        setIsPasswordProtected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  };

  const verifyPassword = async (password) => {
    try {
      const result = await ipcRenderer.invoke('auth:verifyPassword', password);
      if (result) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const setEncryption = async (key) => {
    try {
      const result = await ipcRenderer.invoke('auth:setEncryption', key);
      if (result) {
        setIsEncryptionEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting encryption:', error);
      return false;
    }
  };

  const disableEncryption = async () => {
    try {
      const result = await ipcRenderer.invoke('auth:disableEncryption');
      if (result) {
        setIsEncryptionEnabled(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disabling encryption:', error);
      return false;
    }
  };

  const removePassword = async (currentPassword) => {
    try {
      const result = await ipcRenderer.invoke('auth:removePassword', currentPassword);
      if (result) {
        setIsPasswordProtected(false);
        setIsAuthenticated(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing password:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    isPasswordProtected,
    isEncryptionEnabled,
    isLoading,
    setPassword,
    verifyPassword,
    setEncryption,
    disableEncryption,
    removePassword,
    checkSecurityStatus
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

module.exports = { AuthProvider, useAuth }; 