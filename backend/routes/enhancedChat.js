import express from 'express';
import jwt from 'jsonwebtoken';
import chatService from '../services/chatService.js';
import dualModelChatService from '../services/dualModelChatService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configuration for which service to use
const USE_DUAL_MODEL = process.env.USE_DUAL_MODEL === 'true';

/**
 * Helper function to get the appropriate chat service
 */
function getChatService() {
    return USE_DUAL_MODEL ? dualModelChatService : chatService;
}

// Enhanced chat endpoint with dual model support
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = req.user?.id || 'authenticated-user';

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`📨 Received message from user: ${userId} - Message: "${message.substring(0, 50)}..."`);
        console.log(`🤖 Using ${USE_DUAL_MODEL ? 'Dual Model' : 'Original'} service`);

        const service = getChatService();
        
        // Generate AI response
        const response = await service.generateResponse(
            message, 
            userId, 
            conversationHistory
        );

        console.log('🤖 Generated response:', {
            source: response.source,
            mood: response.mood,
            confidence: response.confidence
        });

        const responseData = {
            success: true,
            data: {
                message: response.text,
                mood: response.mood,
                confidence: response.confidence,
                source: response.source,
                timestamp: new Date().toISOString()
            }
        };

        // Add dual model specific data if available
        if (response.analysis) {
            responseData.data.analysis = {
                intent: response.analysis.intent,
                emotion_intensity: response.analysis.emotion_intensity,
                sarcasm_level: response.analysis.sarcasm_level_request
            };
        }

        if (response.model_info) {
            responseData.data.model_info = response.model_info;
        }

        if (response.generation_time) {
            responseData.data.generation_time = response.generation_time;
        }

        res.json(responseData);

    } catch (error) {
        console.error('❌ Enhanced chat error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Send a message without authentication (for testing)
router.post('/send-no-auth', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = 'anonymous-user';

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`📨 Anonymous message: "${message.substring(0, 50)}..."`);
        console.log(`🤖 Using ${USE_DUAL_MODEL ? 'Dual Model' : 'Original'} service`);

        const service = getChatService();
        const response = await service.generateResponse(
            message, 
            userId, 
            conversationHistory
        );

        const responseData = {
            success: true,
            data: {
                message: response.text,
                mood: response.mood,
                confidence: response.confidence,
                source: response.source,
                timestamp: new Date().toISOString()
            }
        };

        // Add dual model specific data if available
        if (response.analysis) {
            responseData.data.analysis = {
                intent: response.analysis.intent,
                emotion_intensity: response.analysis.emotion_intensity,
                sarcasm_level: response.analysis.sarcasm_level_request
            };
        }

        if (response.model_info) {
            responseData.data.model_info = response.model_info;
        }

        res.json(responseData);

    } catch (error) {
        console.error('❌ Anonymous chat error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Service status endpoint
router.get('/status', async (req, res) => {
    try {
        const service = getChatService();
        
        let status;
        if (USE_DUAL_MODEL) {
            status = await dualModelChatService.getServiceStatus();
            status.service_type = 'dual_model';
        } else {
            status = await chatService.getMLServiceStatus();
            status.service_type = 'original';
        }

        res.json({
            success: true,
            data: {
                current_service: USE_DUAL_MODEL ? 'dual_model' : 'original',
                ...status
            }
        });

    } catch (error) {
        console.error('Service status error:', error);
        res.status(500).json({
            error: 'Failed to get service status',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
        });
    }
});

// Switch service mode (for development/testing)
router.post('/switch-service', async (req, res) => {
    try {
        const { service_type } = req.body;
        
        if (service_type !== 'dual_model' && service_type !== 'original') {
            return res.status(400).json({ 
                error: 'Invalid service type. Must be "dual_model" or "original"' 
            });
        }

        // This would require restarting the service in practice
        // For now, just return the current configuration
        res.json({
            success: true,
            data: {
                message: `Service switch requested to: ${service_type}`,
                current_service: USE_DUAL_MODEL ? 'dual_model' : 'original',
                note: 'Restart server with USE_DUAL_MODEL environment variable to switch'
            }
        });

    } catch (error) {
        console.error('Service switch error:', error);
        res.status(500).json({ error: 'Failed to switch service' });
    }
});

// Test both services (for comparison)
router.post('/compare', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = 'comparison-test';

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`🔄 Comparing services for message: "${message.substring(0, 50)}..."`);

        // Get responses from both services
        const [originalResponse, dualModelResponse] = await Promise.allSettled([
            chatService.generateResponse(message, userId, conversationHistory),
            dualModelChatService.generateResponse(message, userId, conversationHistory)
        ]);

        const comparison = {
            success: true,
            data: {
                message: message,
                timestamp: new Date().toISOString(),
                responses: {
                    original: originalResponse.status === 'fulfilled' ? {
                        success: true,
                        ...originalResponse.value
                    } : {
                        success: false,
                        error: originalResponse.reason?.message || 'Unknown error'
                    },
                    dual_model: dualModelResponse.status === 'fulfilled' ? {
                        success: true,
                        ...dualModelResponse.value
                    } : {
                        success: false,
                        error: dualModelResponse.reason?.message || 'Unknown error'
                    }
                }
            }
        };

        res.json(comparison);

    } catch (error) {
        console.error('❌ Comparison error:', error);
        res.status(500).json({
            error: 'Failed to compare services',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get available models and configuration
router.get('/models', async (req, res) => {
    try {
        const service = getChatService();
        
        let modelsData;
        if (USE_DUAL_MODEL) {
            modelsData = {
                analysis_model: 'gpt-4o-mini',
                response_model: 'grok-beta',
                fallback_models: ['local_ml', 'pattern_based'],
                service_mode: await dualModelChatService.getServiceMode()
            };
        } else {
            try {
                modelsData = await chatService.getAvailableModels();
            } catch (error) {
                modelsData = {
                    service_mode: 'fallback',
                    available_models: ['contextual_responses']
                };
            }
        }

        res.json({
            success: true,
            data: {
                current_service: USE_DUAL_MODEL ? 'dual_model' : 'original',
                ...modelsData
            }
        });

    } catch (error) {
        console.error('Models error:', error);
        res.status(500).json({ 
            error: 'Failed to get model information',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
        });
    }
});

// Health check for enhanced chat service
router.get('/health', async (req, res) => {
    try {
        const service = getChatService();
        const healthData = {
            service_type: USE_DUAL_MODEL ? 'dual_model' : 'original',
            status: 'healthy',
            timestamp: new Date().toISOString()
        };

        if (USE_DUAL_MODEL) {
            const status = await dualModelChatService.getServiceStatus();
            healthData.services = status;
        } else {
            const status = await chatService.getMLServiceStatus();
            healthData.ml_service = status;
        }

        res.json({
            success: true,
            data: healthData
        });

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Health check failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Service health check failed'
        });
    }
});

export default router;