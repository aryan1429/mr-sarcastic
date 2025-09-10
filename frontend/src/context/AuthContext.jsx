import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credential) => {
    // Mock login - just set some user data
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (userData) => {
    // Mock signup - just set user data
    const mockUser = {
      id: '1',
      name: userData.username || 'New User',
      email: userData.email
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    signup,
    loading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
