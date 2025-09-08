import { OAuth2Client } from 'google-auth-library';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage' // For web applications
    );
  }

  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
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
      const { tokens } = await this.client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  async getGoogleProfile(accessToken) {
    try {
      this.client.setCredentials({ access_token: accessToken });
      
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
