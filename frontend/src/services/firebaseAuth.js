import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase.js';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
  }

  // Subscribe to auth state changes - simplified version
  onAuthStateChanged(callback) {
    console.log("Setting up Firebase onAuthStateChanged listener");
    
    // Use Firebase's built-in onAuthStateChanged directly
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase onAuthStateChanged triggered:", user ? user.email : "No user");
      this.currentUser = user;
      callback(user);
    }, (error) => {
      console.error("Firebase auth state change error:", error);
      callback(null); // Call with null user on error
    });
    
    return unsubscribe;
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        idToken
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message);
    }
  }

  // Email/Password Sign-Up
  async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        idToken
      };
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw new Error(error.message);
    }
  }

  // Email/Password Sign-In
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        idToken
      };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw new Error(error.message);
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign-out error:', error);
      throw new Error(error.message);
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Get current user's ID token
  async getCurrentUserIdToken() {
    const user = this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;