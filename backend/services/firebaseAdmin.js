import admin from 'firebase-admin';

class FirebaseAdminService {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // For development, we'll use environment variables
      // In production, you should use a service account key file
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "mr-sarcastic-test",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "test-key-id",
        private_key: (process.env.FIREBASE_PRIVATE_KEY || "test-private-key").replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@mr-sarcastic-test.iam.gserviceaccount.com",
        client_id: process.env.FIREBASE_CLIENT_ID || "123456789",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40${process.env.FIREBASE_PROJECT_ID || 'mr-sarcastic-test'}.iam.gserviceaccount.com`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || "mr-sarcastic-test"
      });

      this.initialized = true;
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.log('⚠️  Firebase Admin initialization failed - using mock mode:', error.message);
      this.initialized = false;
    }
  }

  async verifyIdToken(idToken) {
    try {
      if (!this.initialized) {
        // Mock mode for development
        console.log('🔧 Firebase Admin in mock mode - accepting any token');
        return {
          uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://via.placeholder.com/150',
          emailVerified: true,
          firebase: {
            sign_in_provider: 'google.com'
          }
        };
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        emailVerified: decodedToken.email_verified,
        firebase: decodedToken.firebase
      };
    } catch (error) {
      console.error('Firebase ID token verification failed:', error);
      throw new Error('Invalid Firebase ID token');
    }
  }

  async getUserById(uid) {
    try {
      if (!this.initialized) {
        // Mock mode for development
        return {
          uid: uid,
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://via.placeholder.com/150',
          emailVerified: true
        };
      }

      const userRecord = await admin.auth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified
      };
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      throw new Error('User not found');
    }
  }
}

export default new FirebaseAdminService();