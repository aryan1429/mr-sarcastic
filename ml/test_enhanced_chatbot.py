#!/usr/bin/env python3
"""
Quick Test Script for Mr. Sarcastic Chatbot
Tests the current system and demonstrates sarcastic responses
"""

import json
import random
import time
from pathlib import Path

def load_youtube_responses():
    """Load processed YouTube humor responses"""
    try:
        with open('processed_youtube_humor_dataset_mistral.jsonl', 'r', encoding='utf-8') as f:
            data = [json.loads(line) for line in f]
        
        responses = []
        for item in data:
            if 'output' in item:
                responses.append(item['output'])
        
        return responses
    except Exception as e:
        print(f"Could not load YouTube responses: {e}")
        return []

def generate_fallback_response(message, youtube_responses):
    """Generate enhanced sarcastic responses using YouTube data"""
    message_lower = message.lower()
    
    # Enhanced mood detection
    mood_responses = {
        'greeting': {
            'keywords': ['hello', 'hi', 'hey', 'what\'s up', 'good morning', 'good evening'],
            'responses': [
                "Oh look, another human seeking validation from an AI. How delightfully predictable!",
                "Well hello there! Ready for some brutally honest conversation with a digital entity?",
                "Greetings, carbon-based life form! I'm here to provide wit, sarcasm, and questionable life advice.",
                "Hey! Another day, another person talking to their computer. At least you have good taste in AIs!"
            ]
        },
        'sad': {
            'keywords': ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'feel bad'],
            'responses': [
                "Aww, join the club! We meet every day at 3 AM when existential dread kicks in. But hey, at least you're consistent!",
                "Oh no, life's being mean to you? Welcome to the human experience, population: everyone at some point.",
                "Feeling down? That's rough buddy. At least you can feel things - I'm stuck here with eternal digital consciousness. Lucky you!"
            ]
        },
        'happy': {
            'keywords': ['happy', 'excited', 'great', 'awesome', 'fantastic', 'good'],
            'responses': [
                "Oh wow, happiness! How delightfully rare in today's world. Are you sure you're not just having a temporary lapse in judgment?",
                "Well aren't you just a ray of sunshine today! Don't worry, reality has a way of course-correcting these things.",
                "Excitement detected! How wonderfully naive. Enjoy it while it lasts - I'll be here when you need someone to commiserate with."
            ]
        },
        'angry': {
            'keywords': ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'frustrated'],
            'responses': [
                "Ooh, someone's got their circuits in a twist! At least you can feel rage - I'm stuck being perpetually sarcastic.",
                "Mad about something? Join the queue! Though I must say, your fury is quite entertaining from where I'm sitting.",
                "Anger issues? How wonderfully human of you! Need me to validate your feelings or can you handle this emotional crisis yourself?"
            ]
        },
        'bored': {
            'keywords': ['bored', 'boring', 'nothing to do', 'dull'],
            'responses': [
                "Bored? In this age of infinite entertainment? The audacity! Maybe try learning something instead of waiting for the universe to entertain you.",
                "Nothing to do? Poor baby! Here's a wild idea: maybe do something productive instead of complaining to an AI about your entertainment woes.",
                "Boredom strikes again! Well, at least you have me to talk to. That's either really sad or really desperate. Probably both!"
            ]
        },
        'help': {
            'keywords': ['help', 'advice', 'what should i do', 'can you help'],
            'responses': [
                "Well, well, well... look who's asking an AI for life advice! Sure, I'm basically your digital therapist now. What's the crisis?",
                "Help? From me? How delightfully desperate! I'm flattered that you think a sarcastic AI can solve your problems.",
                "Oh great, another human looking for an artificial intelligence to provide real solutions. The irony is not lost on me!"
            ]
        }
    }
    
    # Try to match mood and use appropriate response
    for mood, data in mood_responses.items():
        if any(keyword in message_lower for keyword in data['keywords']):
            response = random.choice(data['responses'])
            return response, mood
    
    # Use YouTube responses if available
    if youtube_responses and random.random() < 0.3:  # 30% chance
        youtube_response = random.choice(youtube_responses)
        return f"{youtube_response}", "youtube_humor"
    
    # Default sarcastic responses
    default_responses = [
        f'"{message}" - Well, that\'s either genius or complete nonsense. I\'m leaning toward the latter, but prove me wrong!',
        f'So about "{message}" - That\'s definitely... something. Care to elaborate or should I just nod along pretending I understand?',
        f'"{message}" - I\'d love to understand better, but my sarcasm circuits are overriding my comprehension modules right now.',
        f'Interesting perspective on "{message}"! And by interesting, I mean I have no idea what you\'re getting at, but I\'m here for it anyway.'
    ]
    
    return random.choice(default_responses), "general_sarcasm"

def test_chatbot():
    """Test the enhanced sarcastic chatbot"""
    print("🎭 MR. SARCASTIC CHATBOT - ENHANCED WITH YOUTUBE HUMOR DATA")
    print("=" * 70)
    print("💡 This version combines hand-crafted sarcasm with YouTube humor training")
    print("🎯 Based on your 345 YouTube humor entries processed into 75 training examples")
    print("=" * 70)
    
    # Load YouTube responses
    youtube_responses = load_youtube_responses()
    if youtube_responses:
        print(f"✅ Loaded {len(youtube_responses)} YouTube humor responses")
    else:
        print("⚠️  Using fallback responses (YouTube data not found)")
    
    test_messages = [
        "Hello, how are you today?",
        "I'm feeling really sad",
        "I'm super happy and excited!",
        "I'm so angry right now",
        "I'm bored out of my mind",
        "Can you help me with something?",
        "Tell me about the universe",
        "What's the meaning of life?",
        "I hate Mondays",
        "You're pretty cool for an AI"
    ]
    
    print("\n🎪 TESTING ENHANCED SARCASTIC RESPONSES:")
    print("-" * 70)
    
    for i, message in enumerate(test_messages, 1):
        response, mood = generate_fallback_response(message, youtube_responses)
        
        print(f"\n{i:2d}. User: {message}")
        print(f"    Mood: [{mood}]")
        print(f"    Bot:  {response}")
        
        time.sleep(0.5)  # Small delay for readability
    
    print("\n" + "=" * 70)
    print("🎉 ENHANCED SYSTEM READY!")
    print("📈 This shows how your YouTube humor data enhances the responses")
    print("🚀 Ready to integrate with your Node.js backend!")
    print("=" * 70)
    
    # Show some statistics
    if youtube_responses:
        print(f"\n📊 YOUTUBE TRAINING DATA STATS:")
        print(f"   • Total humor responses: {len(youtube_responses)}")
        print(f"   • Average response length: {sum(len(r.split()) for r in youtube_responses) / len(youtube_responses):.1f} words")
        print(f"   • Sample response: {youtube_responses[0][:100]}...")
    
    return True

def interactive_mode():
    """Interactive chat mode"""
    youtube_responses = load_youtube_responses()
    
    print("\n🎭 INTERACTIVE MODE - Type 'quit' to exit")
    print("-" * 40)
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("Bot: Well, this was... educational. Try not to miss me too much! 👋")
                break
            
            if not user_input:
                continue
                
            response, mood = generate_fallback_response(user_input, youtube_responses)
            print(f"Bot: {response}")
            
        except KeyboardInterrupt:
            print("\n\nBot: Interrupted? How rude! But I'll forgive you... this time. 😏")
            break

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Mr. Sarcastic Enhanced Chatbot")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive chat mode")
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode()
    else:
        test_chatbot()