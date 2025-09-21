#!/usr/bin/env python3
"""
Simple ML Service for Mr. Sarcastic
HTTP server using built-in libraries only
"""

import json
import random
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Response data
RESPONSES = {
    "greeting": [
        "Oh, a greeting! How refreshingly original. Hi there, I'm Mr. Sarcastic, your AI companion with trust issues and a dark sense of humor.",
        "Well, well, well... another human seeking digital validation. Hello! I'm Mr. Sarcastic, ready to chat and judge your life choices.",
        "Hey yourself! I'm Mr. Sarcastic - think of me as that friend who tells you what you need to hear, not what you want to hear."
    ],
    "identity": [
        "I'm Mr. Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. Think of me as a digital roast master with a heart.",
        "I'm a bot, but not just any bot - I'm Mr. Sarcastic, designed to be your entertaining digital companion with questionable advice and witty comebacks.",
        "I'm an AI with attitude, created to bring some sarcasm and humor to your day. I'm like that friend who's brutally honest but means well."
    ],
    "confusion": [
        "I'm processing... processing... Ah, I see you've mastered the art of confusing an AI. Impressive! Care to elaborate?",
        "That's either pure genius or complete gibberish. I'm leaning toward gibberish, but I admire your confidence.",
        "Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it anyway."
    ],
    "questions": [
        "Great question! Let me consult my vast database of... oh wait, I'm just going to wing it and hope for the best.",
        "You ask as if I have cosmic wisdom. Plot twist: I'm just really good at making stuff sound profound.",
        "Hmm, let me think... Nope, still confused. Want to try rephrasing that in human language?"
    ],
    "general": [
        "Well, that's a statement! I'm not sure what to do with it, but I respect the commitment to chaos.",
        "Fascinating! It's like watching someone try to explain quantum physics using interpretive dance.",
        "I understand you about as well as you understand yourself - which is to say, we're both winging it."
    ]
}

class SarcasticResponseHandler(BaseHTTPRequestHandler):
    """HTTP request handler for sarcastic responses"""
    
    def __init__(self, *args, **kwargs):
        self.start_time = time.time()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            uptime = time.time() - self.start_time
            response = {
                "status": "healthy",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "service_uptime": uptime,
                "model_status": {
                    "is_loaded": True,
                    "model_key": "simple_sarcastic",
                    "model_name": "Simple Sarcastic Response Generator",
                    "device": "cpu",
                    "supports_fine_tuned": False,
                    "response_categories": len(RESPONSES)
                }
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/chat':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                message = request_data.get('message', '').strip()
                if not message:
                    self.send_error(400, "Message is required")
                    return
                
                # Generate response
                intent = self.detect_intent(message)
                mood = self.detect_mood(message)
                response_category = RESPONSES.get(intent, RESPONSES["general"])
                response_text = random.choice(response_category)
                
                response = {
                    "response": response_text,
                    "mood_detected": mood,
                    "confidence": 0.95,
                    "source": "simple_ml_backend",
                    "model_info": {
                        "model_type": "pattern_matching",
                        "version": "1.0.0",
                        "loaded": True
                    },
                    "generation_time": 0.001
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"Error processing chat request: {e}")
                self.send_error(500, "Internal server error")
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def detect_intent(self, message):
        """Detect user intent from message"""
        message_lower = message.lower().strip()
        
        # Greeting patterns
        if any(word in message_lower for word in ['hi', 'hello', 'hey', 'greetings']):
            return "greeting"
        
        # Identity/who questions
        if any(phrase in message_lower for phrase in ['who are you', 'what are you', 'who is', 'what is bot', 'favorite color', 'about you']):
            return "identity"
        
        # Confusion patterns
        if any(phrase in message_lower for phrase in ['what are you talking about', 'confused', 'makes no sense', 'understand']):
            return "confusion"
        
        # Questions
        if '?' in message:
            return "questions"
        
        return "general"
    
    def detect_mood(self, message):
        """Simple mood detection"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['angry', 'mad', 'furious', 'hate', 'annoyed']):
            return "angry"
        elif any(word in message_lower for word in ['happy', 'excited', 'joy', 'great', 'awesome']):
            return "happy"
        elif any(word in message_lower for word in ['sad', 'depressed', 'down', 'unhappy']):
            return "sad"
        elif any(word in message_lower for word in ['bored', 'boring', 'meh', 'whatever']):
            return "bored"
        else:
            return "neutral"
    
    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server():
    """Run the HTTP server"""
    server_address = ('localhost', 8002)
    httpd = HTTPServer(server_address, SarcasticResponseHandler)
    print("🎭 Starting Mr. Sarcastic Simple ML Backend...")
    print("📡 Simple HTTP server with pattern matching")
    print("✨ Ready for sarcastic conversations!")
    print(f"🚀 Server running on http://localhost:8002")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
        httpd.shutdown()
        httpd.server_close()
    except Exception as e:
        print(f"❌ Server error: {e}")
        httpd.shutdown()
        httpd.server_close()

if __name__ == "__main__":
    run_server()