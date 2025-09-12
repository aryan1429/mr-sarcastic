import express from 'express';
import chatService from '../services/chatService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send a message and get AI response
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = req.user.id;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Generate AI response
        const response = await chatService.generateResponse(
            message, 
            userId, 
            conversationHistory
        );

        // You could save the conversation to database here
        // await saveConversation(userId, message, response.text);

        res.json({
            success: true,
            data: {
                message: response.text,
                mood: response.mood,
                confidence: response.confidence,
                source: response.source,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Train the model with custom data
router.post('/train', authenticateToken, async (req, res) => {
    try {
        const { customData, youtubeUrls, maxSteps = 500 } = req.body;

        if (!customData && !youtubeUrls) {
            return res.status(400).json({ 
                error: 'Either customData or youtubeUrls must be provided for training' 
            });
        }

        const trainingData = {
            custom_data: customData,
            youtube_urls: youtubeUrls,
            max_steps: maxSteps
        };

        const result = await chatService.trainModel(trainingData);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Training error:', error);
        res.status(500).json({
            error: 'Failed to train model',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Training service unavailable'
        });
    }
});

// Get training status
router.get('/training-status', authenticateToken, async (req, res) => {
    try {
        const status = await chatService.getTrainingStatus();
        
        res.json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('Training status error:', error);
        res.status(500).json({
            error: 'Failed to get training status',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Training service unavailable'
        });
    }
});

// Get available moods and sample responses (for testing)
router.get('/moods', (req, res) => {
    try {
        const moods = ['sad', 'happy', 'angry', 'bored', 'neutral'];
        res.json({
            success: true,
            data: {
                available_moods: moods,
                default_mood: 'neutral'
            }
        });
    } catch (error) {
        console.error('Moods error:', error);
        res.status(500).json({ error: 'Failed to get moods' });
    }
});

// Health check for chat service
router.get('/health', async (req, res) => {
    try {
        const status = await chatService.getTrainingStatus();
        res.json({
            success: true,
            data: {
                chat_service: 'healthy',
                ml_service_connected: status.model_trained !== undefined,
                model_status: status
            }
        });
    } catch (error) {
        res.json({
            success: true,
            data: {
                chat_service: 'healthy',
                ml_service_connected: false,
                fallback_mode: true
            }
        });
    }
});

export default router;
