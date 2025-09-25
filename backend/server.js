import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authFirebase.js';  // Updated to use Firebase auth
import userRoutes from './routes/users.js';
import storageRoutes from './routes/storage.js';
import chatRoutes from './routes/chat.js';
import enhancedChatRoutes from './routes/enhancedChat.js';  // New enhanced chat routes
import databaseService from './services/database.js';
import mockDatabaseService from './services/mockDatabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log startup configuration
console.log('🚀 Starting Mr. Sarcastic Backend Server...');
console.log(`🤖 Dual Model Service: ${process.env.USE_DUAL_MODEL === 'true' ? 'ENABLED' : 'DISABLED'}`);
console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
console.log(`🤖 Grok API: ${process.env.GROK_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
console.log(`📡 ML Service: ${process.env.ML_SERVICE_URL || 'http://localhost:8001'}`);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log(`CORS configured for frontend URL: ${frontendUrl}`);
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/enhanced-chat', enhancedChatRoutes);  // New enhanced chat with dual model support

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server accessible at: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);

  try {
    // Try to connect to MongoDB first
    await databaseService.connect();
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.log('MongoDB connection failed, falling back to mock database...');
    try {
      // Use mock database
      await mockDatabaseService.connect();
      console.log('Using mock database for development');
    } catch (mockError) {
      console.error('Both MongoDB and mock database failed:', mockError);
      // Don't exit, just log the error
    }
  }
});
