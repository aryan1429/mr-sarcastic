#!/usr/bin/env python3
"""
Simple ML Service for Mr. Sarcastic
HTTP server with context awareness and song suggestions
"""

import json
import random
import time
import os
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load songs data
SONGS = []
try:
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up to backend directory, then to data folder
    songs_path = os.path.join(script_dir, '..', 'data', 'songs.json')
    with open(songs_path, 'r', encoding='utf-8') as f:
        SONGS = json.load(f)
    print(f"[OK] Loaded {len(SONGS)} songs from playlist")
except Exception as e:
    print(f"[ERROR] Error loading songs: {e}")
    SONGS = []

# Conversation history storage (simple in-memory)
CONVERSATION_HISTORY = {}

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
    "song_request": [
        "Oh, you want music recommendations? How original! Let me consult my superior taste in music...",
        "Music suggestions based on your mood? Fine, I'll be your personal DJ for a moment.",
        "Ah, looking for the perfect soundtrack to your life's drama? I've got you covered.",
        "Let me guess, your usual Spotify algorithm isn't cutting it? Well, lucky for you, I have actual good taste."
    ],
    "general": [
        "Well, that's a statement! I'm not sure what to do with it, but I respect the commitment to chaos.",
        "Fascinating! It's like watching someone try to explain quantum physics using interpretive dance.",
        "I understand you about as well as you understand yourself - which is to say, we're both winging it."
    ]
}

def get_songs_by_mood(mood, limit=3):
    """Get songs matching the detected mood"""
    # Map detected moods to song moods
    mood_mapping = {
        'sad': ['Sad'],
        'happy': ['Happy'],
        'angry': ['Angry'], 
        'bored': ['Chill', 'Relaxed'],
        'energetic': ['Energetic'],
        'chill': ['Chill', 'Relaxed'],
        'focus': ['Focus'],
        'relaxed': ['Relaxed'],
        'neutral': ['Happy', 'Energetic', 'Chill']
    }
    
    target_moods = mood_mapping.get(mood.lower(), ['Happy', 'Energetic'])
    
    # Filter songs by mood
    matching_songs = [song for song in SONGS if song.get('mood') in target_moods]
    
    # Shuffle and return limited number of songs
    random.shuffle(matching_songs)
    return matching_songs[:limit]

def format_song_recommendations(songs, mood):
    """Format song recommendations with sarcastic flair"""
    if not songs:
        return "I'd suggest some songs, but seems like my playlist is taking a break. Maybe try humming your own tune?"
    
    mood_texts = {
        'sad': "feeling a bit down, so here are some songs that might resonate with your soul (or make you cry more, your choice)",
        'happy': "in a good mood! Here are some upbeat tracks to keep that energy flowing",
        'angry': "feeling some rage, so here are some tracks to help you channel that energy",
        'bored': "looking to chill out, so here are some relaxing vibes for you",
        'energetic': "pumped up! Here are some high-energy songs to fuel your enthusiasm",
        'chill': "wanting to relax, so here are some chill vibes for you",
        'focus': "need to concentrate, so here are some focus-friendly tracks",
        'relaxed': "in a mellow mood, so here are some peaceful songs",
        'neutral': "in the mood for some music"
    }
    
    mood_text = mood_texts.get(mood.lower(), "in the mood for some music")
    
    recommendation = f"I see you're {mood_text}:\n\n"
    
    for i, song in enumerate(songs, 1):
        recommendation += f"{i}. **{song['title']}** by {song['artist']}\n"
        recommendation += f"   {song['youtubeUrl']}\n"
        recommendation += f"   Duration: {song['duration']} | Mood: {song['mood']}\n\n"
    
    recommendation += "These are straight from our Songs page playlist - only the finest curated tracks for your sophisticated taste! 🎵"
    
    return recommendation

def update_conversation_history(user_id, message, response):
    """Update conversation history for context awareness"""
    if user_id not in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[user_id] = []
    
    CONVERSATION_HISTORY[user_id].append({
        'message': message,
        'response': response,
        'timestamp': time.time()
    })
    
    # Keep only last 10 exchanges to manage memory
    if len(CONVERSATION_HISTORY[user_id]) > 10:
        CONVERSATION_HISTORY[user_id] = CONVERSATION_HISTORY[user_id][-10:]

def get_conversation_context(user_id):
    """Get recent conversation context for better responses"""
    return CONVERSATION_HISTORY.get(user_id, [])

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
                    "model_key": "simple_sarcastic_enhanced",
                    "model_name": "Enhanced Sarcastic Response Generator with Songs",
                    "device": "cpu",
                    "supports_fine_tuned": False,
                    "response_categories": len(RESPONSES),
                    "songs_loaded": len(SONGS),
                    "context_aware": True,
                    "conversation_sessions": len(CONVERSATION_HISTORY)
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
                logger.info(f"Received chat request to {parsed_path.path}")
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                message = request_data.get('message', '').strip()
                user_id = request_data.get('userId', 'anonymous')
                
                logger.info(f"Processing message: '{message}' from user: {user_id}")
                
                if not message:
                    self.send_error(400, "Message is required")
                    return
                
                # Get conversation context
                context = get_conversation_context(user_id)
                
                # Generate response
                intent = self.detect_intent(message, context)
                mood = self.detect_mood(message)
                
                logger.info(f"Detected intent: {intent}, mood: {mood}")
                
                # Check if this is a song request (use intent or fallback method)
                is_song_request = (intent == "song_request") or self.is_song_request(message)
                
                logger.info(f"Is song request: {is_song_request}")
                
                if is_song_request:
                    # Generate song recommendations
                    songs = get_songs_by_mood(mood, 3)
                    intro = random.choice(RESPONSES["song_request"])
                    song_recommendations = format_song_recommendations(songs, mood)
                    response_text = f"{intro}\n\n{song_recommendations}"
                    logger.info(f"Generated song recommendations for mood: {mood}")
                else:
                    # Generate contextual response
                    response_text = self.generate_contextual_response(message, intent, mood, context)
                    logger.info(f"Generated contextual response for intent: {intent}")
                
                # Update conversation history
                update_conversation_history(user_id, message, response_text)
                
                response = {
                    "response": response_text,
                    "mood_detected": mood,
                    "confidence": 0.95,
                    "source": "simple_ml_backend_enhanced",
                    "model_info": {
                        "model_type": "contextual_pattern_matching",
                        "version": "2.0.0",
                        "loaded": True,
                        "has_songs": len(SONGS) > 0,
                        "context_aware": True
                    },
                    "generation_time": 0.001,
                    "has_song_suggestions": is_song_request
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
                logger.info(f"Sent response successfully")
                
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
    
    def detect_intent(self, message, context=None):
        """Detect user intent from message with context awareness"""
        message_lower = message.lower().strip()
        
        # Check recent context for better understanding
        if context:
            recent_messages = [entry['message'].lower() for entry in context[-3:]]
            recent_context = ' '.join(recent_messages)
        else:
            recent_context = ""
        
        # Song/music request patterns (enhanced)
        song_patterns = [
            'suggest', 'recommend', 'song', 'music', 'playlist', 'listen', 'track',
            'what should i listen', 'what to listen', 'play something', 'any songs'
        ]
        if any(pattern in message_lower for pattern in song_patterns):
            return "song_request"
        
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
        """Enhanced mood detection"""
        message_lower = message.lower()
        
        # Enhanced mood keywords
        sad_keywords = ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'lonely', 'blue', 'melancholy']
        happy_keywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'fantastic', 'good', 'cheerful', 'elated']
        angry_keywords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'frustrated', 'irritated']
        bored_keywords = ['bored', 'boring', 'dull', 'tired', 'meh', 'whatever', 'sleepy']
        energetic_keywords = ['energetic', 'pumped', 'hyper', 'motivated', 'ready', 'workout', 'party']
        chill_keywords = ['chill', 'relaxed', 'calm', 'peaceful', 'mellow', 'zen']
        
        if any(word in message_lower for word in sad_keywords):
            return "sad"
        elif any(word in message_lower for word in happy_keywords):
            return "happy"
        elif any(word in message_lower for word in angry_keywords):
            return "angry"
        elif any(word in message_lower for word in bored_keywords):
            return "bored"
        elif any(word in message_lower for word in energetic_keywords):
            return "energetic"
        elif any(word in message_lower for word in chill_keywords):
            return "chill"
        else:
            return "neutral"
    
    def is_song_request(self, message):
        """Check if the message is requesting song recommendations"""
        message_lower = message.lower()
        
        # Direct song request patterns
        song_request_patterns = [
            'suggest some songs', 'recommend songs', 'any songs', 'play something',
            'what should i listen', 'music recommendation', 'suggest music',
            'recommend music', 'songs for', 'music for', 'playlist', 'track',
            'i want to listen', 'what to listen'
        ]
        
        # Check for explicit song requests
        if any(pattern in message_lower for pattern in song_request_patterns):
            return True
        
        # Check for mood + music combination
        mood_music_patterns = [
            ('sad', ['song', 'music']),
            ('happy', ['song', 'music']),
            ('angry', ['song', 'music']),
            ('bored', ['song', 'music']),
            ('energetic', ['song', 'music']),
            ('chill', ['song', 'music'])
        ]
        
        for mood, music_words in mood_music_patterns:
            if mood in message_lower and any(word in message_lower for word in music_words):
                return True
        
        return False
    
    def generate_contextual_response(self, message, intent, mood, context):
        """Generate contextual responses based on conversation history"""
        message_lower = message.lower().strip()
        
        # Context-aware responses for common patterns
        if message_lower in ['ok', 'okay', 'k']:
            if context and len(context) > 0:
                last_response = context[-1]['response'].lower()
                if 'song' in last_response or 'music' in last_response:
                    return "Glad you liked my music suggestions! Need more recommendations or want to chat about something else?"
                else:
                    return "Just 'ok'? Well, that's... riveting. Got anything more exciting to share?"
            else:
                return "Well, that's a statement! I'm not sure what to do with it, but I respect the commitment to chaos."
        
        elif message_lower in ['bruh', 'bro', 'dude']:
            context_responses = [
                "Bruh indeed! Sometimes that's all that needs to be said.",
                "I see we've reached the 'bruh' level of conversation. I respect that.",
                "Ah yes, the universal expression of mild bewilderment. I get it."
            ]
            return random.choice(context_responses)
        
        elif message_lower in ['nice', 'cool', 'awesome']:
            return "Why thank you! I do try to maintain a certain level of digital sophistication. What else can I help you with?"
        
        # Check for follow-up questions based on context
        if context and len(context) > 0:
            last_response = context[-1]['response'].lower()
            
            # If last response had songs and user says something vague, offer more help
            if 'song' in last_response and len(message_lower) < 10:
                return "Want more music recommendations? Just tell me your mood or what you're looking for!"
        
        # Default to standard responses based on intent
        response_category = RESPONSES.get(intent, RESPONSES["general"])
        return random.choice(response_category)
    
    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server():
    """Run the HTTP server"""
    server_address = ('localhost', 8001)
    httpd = HTTPServer(server_address, SarcasticResponseHandler)
    print("[START] Starting Mr. Sarcastic Simple ML Backend...")
    print("[INFO] Simple HTTP server with pattern matching")
    print("[READY] Ready for sarcastic conversations!")
    print(f"[SERVER] Server running on http://localhost:8001")
    print("[STOP] Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[STOP] Service stopped by user")
        httpd.shutdown()
        httpd.server_close()
    except Exception as e:
        print(f"[ERROR] Server error: {e}")
        httpd.shutdown()
        httpd.server_close()

if __name__ == "__main__":
    run_server()