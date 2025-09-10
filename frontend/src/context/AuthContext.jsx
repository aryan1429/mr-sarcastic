import { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  // Check for existing auth on app start
  useEffect(() => {
    // Simulate checking for stored auth token
    const checkAuth = async () => {
      try {
        // In a real app, you'd check localStorage/sessionStorage for auth tokens
        // For now, just complete the loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    // Handle both email/password and Google login
    let mockUser;
    
    if (credentials.googleCredential) {
      // Google login
      mockUser = {
        id: '1',
        name: 'Google User',
        email: 'google@example.com',
        provider: 'google'
      };
    } else {
      // Email/password login
      mockUser = {
        id: '1',
        name: 'Test User',
        email: credentials.email,
        provider: 'email'
      };
    }
    
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (userData) => {
    // Handle both email/password and Google signup
    let mockUser;
    
    if (userData.googleCredential) {
      // Google signup
      mockUser = {
        id: '1',
        name: 'Google User',
        email: 'google@example.com',
        provider: 'google'
      };
    } else {
      // Email/password signup
      mockUser = {
        id: '1',
        name: userData.username || 'New User',
        email: userData.email,
        provider: 'email'
      };
    }
    
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
