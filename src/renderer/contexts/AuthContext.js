const React = require('react');
const { createContext, useState, useContext, useEffect } = React;
const { ipcRenderer } = require('electron');

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await ipcRenderer.invoke('auth:get-current-user');
        setUser(userData);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await ipcRenderer.invoke('auth:login', { email, password });
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ipcRenderer.invoke('auth:logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await ipcRenderer.invoke('auth:register', userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    !loading && children
  );
};

module.exports = {
  AuthContext,
  useAuth,
  AuthProvider
}; 