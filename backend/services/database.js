import mongoose from 'mongoose';

class DatabaseService {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mr-sarcastic';

      await mongoose.connect(mongoUri, {
        // Modern Mongoose doesn't need these options, but keeping for compatibility
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📡 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host
    };
  }
}

export default new DatabaseService();
