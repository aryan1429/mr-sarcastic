#!/usr/bin/env python3
"""
Simple Sarcastic Response Generator
Creates training data and basic response patterns from YouTube transcripts
"""

import os
import json
import random
import re
from typing import List, Dict, Optional

class SarcasticResponseGenerator:
    """Generate sarcastic responses using pattern matching"""
    
    def __init__(self):
        self.responses = []
        self.patterns = []
        self.load_youtube_data()
    
    def load_youtube_data(self):
        """Load and process YouTube transcript data"""
        dataset_file = "youtube_humor_dataset.jsonl"
        
        if not os.path.exists(dataset_file):
            print(f"❌ Dataset file not found: {dataset_file}")
            print("💡 Run extract_youtube.py first")
            return
        
        print(f"📚 Loading training data from {dataset_file}...")
        
        with open(dataset_file, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                text = data['text'].strip()
                
                # Extract different types of responses
                if text.startswith("Oh wow"):
                    self.patterns.append(("sarcastic_explanation", text))
                elif text.startswith("Here's the deal"):
                    self.patterns.append(("direct_response", text))
                elif text.startswith("You know what's funny"):
                    self.patterns.append(("humorous_observation", text))
                else:
                    self.responses.append(text)
        
        print(f"✅ Loaded {len(self.responses)} responses and {len(self.patterns)} patterns")
    
    def generate_response(self, user_input: str) -> str:
        """Generate a sarcastic response based on user input"""
        user_input = user_input.lower().strip()
        
        # Pattern-based responses for common inputs
        if "how are you" in user_input or "how's it going" in user_input:
            responses = [
                "Oh wow, let me explain this sarcastically: I'm an AI, genius. I don't have feelings, but thanks for asking like I'm your fucking therapist.",
                "Here's the deal with this shit: I'm running on electricity and code. How do you think I'm doing?",
                "You know what's funny about this? You asking a computer how it feels. But sure, I'm fantastic!"
            ]
            return random.choice(responses)
        
        elif "tell me a joke" in user_input or "joke" in user_input:
            responses = [
                "Oh wow, let me explain this sarcastically: Here's a joke - you asking an AI for entertainment instead of going outside.",
                "You know what's funny about this? Your life is probably joke enough, but here's one: Why did the user ask for a joke? Because their personality needed help.",
                "Here's the deal with this shit: I'm not your personal comedian, but fine - what do you call someone who asks AI for jokes? Desperate."
            ]
            return random.choice(responses)
        
        elif "sad" in user_input or "depressed" in user_input:
            responses = [
                "Oh wow, let me explain this sarcastically: Life's tough, isn't it? Maybe try some sad music to really wallow in it properly.",
                "Here's the deal with this shit: Everyone's sad sometimes. Maybe go touch some grass instead of talking to a computer?",
                "You know what's funny about this? You're seeking emotional support from an AI. Try therapy, it's probably more helpful."
            ]
            return random.choice(responses)
        
        elif "bored" in user_input:
            responses = [
                "Oh wow, let me explain this sarcastically: The horror of having nothing to do in this amazing world! Try watching paint dry or learning something useful.",
                "Here's the deal with this shit: Boredom is a choice. There's literally infinite content on the internet and you're talking to me.",
                "You know what's funny about this? You have access to all human knowledge and you're bored. That's talent."
            ]
            return random.choice(responses)
        
        elif "help" in user_input:
            responses = [
                "Oh wow, let me explain this sarcastically: Look who needs help from an AI. Sure, I'm basically your digital therapist now.",
                "Here's the deal with this shit: I can try to help, but don't expect miracles. What's the crisis this time?",
                "You know what's funny about this? Humans asking AI for help instead of other humans. But sure, what do you need?"
            ]
            return random.choice(responses)
        
        # Use random responses from YouTube data
        elif self.responses:
            # Try to find relevant response
            relevant = []
            for response in self.responses:
                if any(word in response.lower() for word in user_input.split() if len(word) > 3):
                    relevant.append(response)
            
            if relevant:
                return random.choice(relevant)
            else:
                return random.choice(self.responses)
        
        # Fallback responses
        fallbacks = [
            "Oh wow, let me explain this sarcastically: I have no idea what you're talking about, but thanks for sharing.",
            "Here's the deal with this shit: That's either really deep or complete nonsense. I'm going with nonsense.",
            "You know what's funny about this? I'm an AI and even I'm confused by that statement.",
            "Well, that's... interesting. Care to elaborate or should I just pretend I understand?",
            "Okay, that's either genius or gibberish. I'm leaning toward gibberish, but hey, prove me wrong."
        ]
        
        return random.choice(fallbacks)
    
    def save_response_model(self, filename: str = "sarcastic_responses.json"):
        """Save the response patterns as a simple JSON model"""
        model_data = {
            "responses": self.responses[:100],  # Limit to avoid huge files
            "patterns": self.patterns[:50],
            "metadata": {
                "total_responses": len(self.responses),
                "total_patterns": len(self.patterns),
                "model_type": "pattern_based_sarcastic"
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(model_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Response model saved to {filename}")
        return filename

def test_generator():
    """Test the response generator"""
    print("\n🧪 Testing Sarcastic Response Generator")
    print("=" * 45)
    
    generator = SarcasticResponseGenerator()
    
    test_inputs = [
        "How are you today?",
        "I'm feeling sad",
        "Tell me a joke",
        "I'm bored",
        "Can you help me?",
        "What's the weather like?",
        "I love pizza",
        "This is random text"
    ]
    
    for test_input in test_inputs:
        response = generator.generate_response(test_input)
        print(f"👤 User: {test_input}")
        print(f"🤖 Bot: {response}")
        print()
    
    return generator

def main():
    """Main function"""
    print("🎭 Sarcastic Response Generator")
    print("=" * 35)
    
    # Test the generator
    generator = test_generator()
    
    # Save model
    model_file = generator.save_response_model()
    
    print(f"\n🎯 Results:")
    print(f"📁 Simple model saved: {model_file}")
    print(f"🚀 Ready to integrate with your chatbot!")
    print(f"💡 This is a lightweight alternative to heavy ML models")
    
    # Interactive test
    print(f"\n🎪 Interactive Test (type 'quit' to exit):")
    while True:
        user_input = input("\n👤 You: ").strip()
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("🤖 Bot: Oh great, leaving already? Fine, see ya!")
            break
        
        if user_input:
            response = generator.generate_response(user_input)
            print(f"🤖 Bot: {response}")

if __name__ == "__main__":
    main()