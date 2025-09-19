import { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

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

  console.log("AuthProvider rendering, loading:", loading, "isAuthenticated:", isAuthenticated);

  // Initialize Firebase Auth and listen for auth state changes
  useEffect(() => {
    console.log("AuthContext useEffect - Initializing Firebase Auth");
    
    const initializeAuth = async () => {
      try {
        console.log("Starting Firebase auth initialization...");
        
        // Set up auth state listener directly without init wrapper
        const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
          console.log("Firebase auth state changed:", user ? user.email : "No user");
          
          if (user) {
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified
            };
            setUser(userData);
            setIsAuthenticated(true);
            
            // Store user data in localStorage for consistency
            localStorage.setItem('userData', JSON.stringify(userData));
          } else {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
          }
          setLoading(false);
          console.log("Loading state set to false");
        });

        // Set timeout to ensure loading is set to false even if Firebase doesn't respond
        const timeout = setTimeout(() => {
          console.log("Firebase auth timeout reached, setting loading to false");
          setLoading(false);
        }, 3000);

        return () => {
          clearTimeout(timeout);
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("Failed to initialize Firebase Auth:", error);
        setLoading(false);
      }
    };

    const cleanup = initializeAuth();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') cleanupFn();
        });
      }
    };
  }, []);

  const login = async (credentials) => {
    try {
      let result;
      
      if (credentials.googleCredential) {
        // Google login using Firebase
        result = await firebaseAuthService.signInWithGoogle();
        
        // Send Firebase ID token to our backend
        const backendResponse = await fetch(`${API_BASE_URL}/auth/firebase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken })
        });
        
        if (!backendResponse.ok) {
          const error = await backendResponse.json();
          throw new Error(error.error || 'Backend authentication failed');
        }
        
        const backendData = await backendResponse.json();
        // Firebase auth state listener will handle setting user state
        
        return result.user;
      } else {
        // Email/password login - use backend directly
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        
        // For email/password, manually set user state since Firebase isn't involved
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        return data.user;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.signOut();
      // Firebase auth state listener will handle clearing user state
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      let result;
      
      if (userData.googleCredential) {
        // Google signup - same as login for Google
        result = await firebaseAuthService.signInWithGoogle();
        
        // Send Firebase ID token to our backend
        const backendResponse = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken })
        });
        
        if (!backendResponse.ok) {
          const error = await backendResponse.json();
          throw new Error(error.error || 'Backend authentication failed');
        }
        
        const backendData = await backendResponse.json();
        // Firebase auth state listener will handle setting user state
        
        return result.user;
      } else {
        // Email/password signup - use backend directly
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: userData.username,
            email: userData.email, 
            password: userData.password 
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registration failed');
        }
        
        const data = await response.json();
        
        // For email/password, manually set user state since Firebase isn't involved
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        return data.user;
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    signup,
    token: getToken(),
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};