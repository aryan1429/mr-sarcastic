// Debug component to check environment variables
import { useEffect } from 'react';

export const DebugEnv = () => {
  useEffect(() => {
    console.log('🔍 Environment Debug Info:');
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('All env vars:', import.meta.env);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
      <div>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID?.substring(0, 20)}...</div>
      <div>Mode: {import.meta.env.MODE}</div>
    </div>
  );
};

// Uncomment this line in App.tsx to enable debug mode:
// {process.env.NODE_ENV === 'development' && <DebugEnv />}
