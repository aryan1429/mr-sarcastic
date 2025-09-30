// Quick test to verify the song recommendation feature
import express from 'express';
import chatService from './backend/services/chatService.js';

const app = express();
app.use(express.json());

// Simple test endpoint
app.post('/test-song', async (req, res) => {
    try {
        const message = req.body.message || "im sad";
        console.log('Testing message:', message);
        
        const response = await chatService.generateResponse(message, 'test-user', []);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        res.json({
            success: true,
            response: response
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3002, () => {
    console.log('Test server running on port 3002');
    console.log('Test with: curl -X POST http://localhost:3002/test-song -H "Content-Type: application/json" -d "{\\"message\\": \\"im sad\\"}"');
});