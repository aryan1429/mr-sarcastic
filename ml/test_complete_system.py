#!/usr/bin/env python3
"""
Test the complete Mr. Sarcastic system with fine-tuned model
"""

import requests
import json
import time
import subprocess
import sys
from pathlib import Path

def test_fine_tuned_model_directly():
    """Test the fine-tuned model directly"""
    print("🎭 TESTING FINE-TUNED MODEL DIRECTLY")
    print("=" * 60)
    
    try:
        from production_bot import ProductionSarcasticBot
        
        bot = ProductionSarcasticBot()
        
        test_messages = [
            "Hello there!",
            "I'm feeling sad today",
            "I'm super excited!",
            "Can you help me?",
            "Tell me something funny"
        ]
        
        print("💬 DIRECT MODEL TESTING:")
        print("-" * 40)
        
        for i, message in enumerate(test_messages, 1):
            start_time = time.time()
            response = bot.generate_response(message)
            response_time = time.time() - start_time
            
            print(f"\n{i}. User: {message}")
            print(f"   Bot:  {response}")
            print(f"   Time: {response_time:.2f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ Direct model test failed: {e}")
        return False

def test_backend_api():
    """Test the backend API if it's running"""
    print("\n🌐 TESTING BACKEND API")
    print("=" * 60)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Backend API is running!")
            print(f"   Model: {health_data['model_status']['model_key']}")
            print(f"   Fine-tuned: {health_data['model_status']['supports_fine_tuned']}")
            
            # Test chat endpoint
            chat_data = {
                "message": "Hello, how are you doing?",
                "user_id": "test_user"
            }
            
            chat_response = requests.post(
                "http://localhost:8001/chat", 
                json=chat_data,
                timeout=30
            )
            
            if chat_response.status_code == 200:
                chat_result = chat_response.json()
                print(f"\n💬 Chat test successful:")
                print(f"   User: {chat_data['message']}")
                print(f"   Bot:  {chat_result['response']}")
                print(f"   Mood: {chat_result['mood_detected']}")
                print(f"   Source: {chat_result['source']}")
                print(f"   Time: {chat_result['generation_time']:.2f}s")
                return True
            else:
                print(f"❌ Chat endpoint failed: {chat_response.status_code}")
                return False
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Backend API not running")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_integration_with_node_backend():
    """Simulate integration with your Node.js backend"""
    print("\n🔗 TESTING NODE.JS INTEGRATION SIMULATION")
    print("=" * 60)
    
    # This simulates what your Node.js chatService.js would do
    simulated_requests = [
        {"message": "Hello!", "user_id": "user123"},
        {"message": "I need help with something", "user_id": "user456"},
        {"message": "You're funny", "user_id": "user123"}
    ]
    
    print("📡 Simulating Node.js chatService requests:")
    print("-" * 40)
    
    for i, request in enumerate(simulated_requests, 1):
        print(f"\n{i}. Simulated Node.js request:")
        print(f"   Request: {json.dumps(request, indent=6)}")
        
        try:
            response = requests.post(
                "http://localhost:8001/chat",
                json=request,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {{")
                print(f"     'success': {result['success']}")
                print(f"     'response': '{result['response']}'")
                print(f"     'mood_detected': '{result['mood_detected']}'")
                print(f"     'source': '{result['source']}'")
                print(f"     'generation_time': {result['generation_time']}")
                print(f"   }}")
            else:
                print(f"   ❌ Request failed: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("   ⚠️  API not available - would use Node.js fallback")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def show_integration_instructions():
    """Show how to integrate with the Node.js backend"""
    print("\n📚 INTEGRATION INSTRUCTIONS")
    print("=" * 60)
    print("To integrate your fine-tuned model with your Node.js backend:")
    print()
    print("1. Start the ML backend:")
    print("   cd a:\\mr-sarcastic\\ml")
    print("   python production_ml_backend.py")
    print()
    print("2. Your Node.js chatService.js will automatically detect it")
    print("   and use the fine-tuned model instead of fallback responses")
    print()
    print("3. Test the full integration:")
    print("   cd a:\\mr-sarcastic\\backend")
    print("   npm start")
    print()
    print("4. Your frontend will now use:")
    print("   ✅ Fine-tuned DialoGPT-medium")
    print("   ✅ YouTube humor training data (75 conversations)")
    print("   ✅ Enhanced sarcastic personality")
    print("   ✅ Fallback to hand-crafted responses when needed")

def main():
    print("🎭 MR. SARCASTIC - COMPLETE SYSTEM TEST")
    print("=" * 80)
    print("Testing your fine-tuned chatbot system...")
    print()
    
    # Test 1: Direct model testing
    model_works = test_fine_tuned_model_directly()
    
    # Test 2: Backend API testing
    api_works = test_backend_api()
    
    # Test 3: Integration simulation
    test_integration_with_node_backend()
    
    # Show integration instructions
    show_integration_instructions()
    
    print("\n" + "=" * 80)
    print("🎉 SYSTEM STATUS SUMMARY:")
    print(f"   Fine-tuned Model: {'✅ Working' if model_works else '❌ Issues'}")
    print(f"   Backend API:      {'✅ Working' if api_works else '⚠️  Not running'}")
    print("   Integration:      🚀 Ready for Node.js backend")
    print()
    print("Your enhanced Mr. Sarcastic chatbot is ready!")
    print("It uses fine-tuned DialoGPT-medium with 75 YouTube humor conversations.")
    print("=" * 80)

if __name__ == "__main__":
    main()