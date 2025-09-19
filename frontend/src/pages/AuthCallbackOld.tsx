import { useEffect, useState } from 'react';
import Auth from './Auth';

const AuthCallback = () => {
  const [isOAuthCallback, setIsOAuthCallback] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if this is an OAuth callback by looking for 'code' parameter
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    // If no OAuth parameters present, this is probably just the regular auth page
    if (!code && !error && !state) {
      console.log('No OAuth parameters found, rendering regular auth page');
      setIsOAuthCallback(false);
      return;
    }

    console.log('OAuth callback detected:', { code: !!code, error, state });
    setIsOAuthCallback(true);

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code && state?.startsWith('oauth_state_')) {
      console.log('Processing OAuth code exchange...', { codeLength: code.length, state });
      
      // Exchange code for tokens on the backend
      console.log('Sending request to /api/auth/google/exchange');
      fetch('/api/auth/google/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
      .then(async response => {
        // Handle both network errors and API errors
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('OAuth exchange response:', data);
        
        if (data.success && data.token) {
          // Authentication successful - store token and user data directly
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          // Send success message to parent window (no credential needed)
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_COMPLETE',
            success: true,
            user: data.user
          }, window.location.origin);
        } else {
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: data.error || 'Authentication failed - no token received'
          }, window.location.origin);
        }
        
        // Try to close window - handle COOP restrictions gracefully
        try {
          window.close();
        } catch (e) {
          console.log('Could not close popup window due to COOP restrictions');
          // Show a user-friendly message instead
          document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
              <div style="text-align: center; padding: 20px;">
                <h2>Authentication Complete</h2>
                <p>You can close this window manually.</p>
              </div>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('OAuth exchange failed:', error);
        
        let errorMessage = 'Network error during authentication';
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to authentication server. Please check your internet connection and try again.';
        } else if (error.message.includes('Server error')) {
          errorMessage = `Server error: ${error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: errorMessage
        }, window.location.origin);
        
        // Try to close window - handle COOP restrictions gracefully
        try {
          window.close();
        } catch (e) {
          console.log('Could not close popup window due to COOP restrictions');
          // Show error message to user
          document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
              <div style="text-align: center; padding: 20px;">
                <h2>Authentication Failed</h2>
                <p>${errorMessage}</p>
                <p style="margin-top: 20px; color: #666;">You can close this window manually.</p>
              </div>
            </div>
          `;
        }
      });
    } else {
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Invalid authorization response'
      }, window.location.origin);
      window.close();
    }
  }, []);

  // If we haven't determined yet, show loading
  if (isOAuthCallback === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If it's not an OAuth callback, render the regular Auth component
  if (!isOAuthCallback) {
    return <Auth />;
  }

  // OAuth callback processing screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;