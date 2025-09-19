import { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth.js';

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
  const [loading, setLoading] = useState(false); // Start with false instead of true

  console.log("AuthProvider rendering, loading:", loading, "isAuthenticated:", isAuthenticated);

  // Check for existing auth on app start
  useEffect(() => {
    console.log("AuthContext useEffect running");
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        console.log("Checking auth - token:", !!token, "userData:", !!userData);
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("User authenticated from localStorage:", parsedUser.username);
          
          // Temporarily disable token verification to test
          // try {
          //   await authService.refreshToken();
          // } catch (error) {
          //   console.error('Token verification failed:', error);
          //   // Clear invalid auth data
          //   localStorage.removeItem('authToken');
          //   localStorage.removeItem('userData');
          //   setUser(null);
          //   setIsAuthenticated(false);
          // }
        } else {
          console.log("No existing auth found");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
        console.log("Auth check completed");
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      let result;
      
      if (credentials.googleCredential) {
        // Google login
        result = await authService.loginWithGoogle(credentials.googleCredential);
      } else {
        // Email/password login
        result = await authService.loginWithEmail(credentials.email, credentials.password);
      }
      
      setUser(result.user);
      setIsAuthenticated(true);
      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to let UI handle the error
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const signup = async (userData) => {
    try {
      let result;
      
      if (userData.googleCredential) {
        // Google signup
        result = await authService.loginWithGoogle(userData.googleCredential);
      } else {
        // Email/password signup
        result = await authService.registerWithEmail(
          userData.username,
          userData.email,
          userData.password
        );
      }
      
      setUser(result.user);
      setIsAuthenticated(true);
      return result.user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error; // Re-throw to let UI handle the error
    }
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
