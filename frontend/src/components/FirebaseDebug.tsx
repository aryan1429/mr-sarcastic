import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.js';

const FirebaseDebug = () => {
  const [authState, setAuthState] = useState('initializing');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("FirebaseDebug: Setting up direct auth listener");
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log("FirebaseDebug: Auth state changed", { user: user ? user.email : null });
        setAuthState('loaded');
        setUser(user);
      },
      (error) => {
        console.error("FirebaseDebug: Auth error", error);
        setError(error.message);
        setAuthState('error');
      }
    );

    // Timeout to detect if Firebase is not responding
    const timeout = setTimeout(() => {
      if (authState === 'initializing') {
        console.warn("FirebaseDebug: Auth state timeout");
        setAuthState('timeout');
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Firebase Debug</h3>
      <p><strong>Auth State:</strong> {authState}</p>
      <p><strong>User:</strong> {user ? user.email : 'None'}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      
      <div style={{ marginTop: '10px' }}>
        <strong>Firebase Config Check:</strong>
        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseDebug;