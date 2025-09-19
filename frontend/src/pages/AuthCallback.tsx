import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';

const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to chat
    if (user && !loading) {
      console.log('User authenticated, redirecting to chat');
      navigate('/chat', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, this will be handled by the useEffect above
  // If not authenticated, show the auth component
  return <Auth />;
};

export default AuthCallback;