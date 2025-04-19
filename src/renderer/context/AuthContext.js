import React, { createContext, useContext, useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setIsPasswordProtected(data.isPasswordProtected);
      setIsEncryptionEnabled(data.isEncryptionEnabled);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking security status:', error);
      setIsLoading(false);
    }
  };

  const setPassword = async (password) => {
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok) {
        setIsPasswordProtected(true);
        return true;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  };

  const verifyPassword = async (password) => {
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.isValid) {
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
      const response = await fetch('/api/auth/set-encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      const data = await response.json();
      if (response.ok) {
        setIsEncryptionEnabled(true);
        return true;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error setting encryption:', error);
      return false;
    }
  };

  const disableEncryption = async () => {
    try {
      const response = await fetch('/api/auth/disable-encryption', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setIsEncryptionEnabled(false);
        return true;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error disabling encryption:', error);
      return false;
    }
  };

  const removePassword = async (currentPassword) => {
    try {
      const response = await fetch('/api/auth/remove-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setIsPasswordProtected(false);
        setIsAuthenticated(false);
        return true;
      }
      throw new Error(data.error);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 