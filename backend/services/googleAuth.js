import { OAuth2Client } from 'google-auth-library';

class GoogleAuthService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      // Log OAuth configuration for debugging
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth';
      
      console.log('GoogleAuthService initialized with:');
      console.log(`- Client ID: ${clientId ? clientId.substring(0, 8) + '...' : 'MISSING'}`);
      console.log(`- Client Secret: ${clientSecret ? 'PROVIDED' : 'MISSING'}`);
      console.log(`- Redirect URI: ${redirectUri}`);
      
      this.client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );
    }
    return this.client;
  }

  async verifyIdToken(idToken) {
    try {
      const ticket = await this.getClient().verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Invalid Google ID token');
    }
  }

  async exchangeCodeForTokens(code) {
    try {
      // Get the redirect URI that was configured
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth';
      console.log(`Attempting to exchange code for tokens with redirect URI: ${redirectUri}`);
      
      // Make sure the OAuth client uses the same redirect URI that was used for the initial request
      const client = this.getClient();
      client.redirectUri = redirectUri;
      
      // Log what we're about to do
      console.log('Code exchange details:', {
        codeLength: code?.length || 0,
        clientId: client._clientId ? client._clientId.substring(0, 8) + '...' : 'MISSING',
        redirectUri: client.redirectUri
      });
      
      // Try to exchange the code for tokens
      const { tokens } = await client.getToken(code);
      
      console.log('Token exchange successful:', {
        access_token: tokens.access_token ? 'RECEIVED' : 'MISSING',
        id_token: tokens.id_token ? 'RECEIVED' : 'MISSING',
        refresh_token: tokens.refresh_token ? 'RECEIVED' : 'MISSING',
      });
      
      return tokens;
    } catch (error) {
      // Log the full error for debugging
      console.error('OAuth code exchange error details:', error);
      
      // Try to extract useful information from various error formats
      let errorMessage = 'Unknown error';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Error response data:', errorData);
        errorMessage = errorData.error_description || errorData.error || 'API Error';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for common OAuth errors
      if (errorMessage.includes('redirect_uri_mismatch')) {
        console.error('CRITICAL ERROR: Redirect URI mismatch. Check Google Cloud Console configuration!');
        console.error(`Current redirect URI: ${this.getClient().redirectUri}`);
      } else if (errorMessage.includes('invalid_grant')) {
        console.error('Invalid grant error - Code may have expired or already been used');
      }
      
      throw new Error(`Failed to exchange authorization code for tokens: ${errorMessage}`);
    }
  }

  async getGoogleProfile(accessToken) {
    try {
      const client = this.getClient();
      client.setCredentials({ access_token: accessToken });
      
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get Google profile');
    }
  }
}

export default new GoogleAuthService();
