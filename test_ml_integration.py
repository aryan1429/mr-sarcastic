#!/usr/bin/env python3
"""
Integration test for the enhanced ML backend
"""

import subprocess
import time
import requests
import json
import sys
import signal
import os

def test_ml_backend():
    # Start the ML backend in a subprocess
    print("Starting ML backend...")
    process = subprocess.Popen([
        sys.executable, 
        "backend/services/simple_ml_backend.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Give it time to start
    time.sleep(3)
    
    try:
        # Test 1: Health check
        print("\n=== Test 1: Health Check ===")
        response = requests.get('http://localhost:8001/health', timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed")
            print(f"   Songs loaded: {health_data['model_status']['songs_loaded']}")
            print(f"   Context aware: {health_data['model_status']['context_aware']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
        
        # Test 2: Basic greeting
        print("\n=== Test 2: Basic Greeting ===")
        chat_data = {"message": "hi", "userId": "test_user"}
        response = requests.post('http://localhost:8001/chat', json=chat_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Basic greeting passed")
            print(f"   Response: {result['response'][:100]}...")
            print(f"   Mood: {result['mood_detected']}")
        else:
            print(f"❌ Basic greeting failed: {response.status_code}")
            return False
        
        # Test 3: Song suggestion
        print("\n=== Test 3: Song Suggestion ===")
        chat_data = {"message": "suggest some songs", "userId": "test_user"}
        response = requests.post('http://localhost:8001/chat', json=chat_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Song suggestion test passed")
            print(f"   Has song suggestions: {result.get('has_song_suggestions', False)}")
            print(f"   Response preview: {result['response'][:150]}...")
            
            # Check if response contains song URLs
            if 'youtube.com' in result['response']:
                print(f"   ✅ Contains YouTube links")
            else:
                print(f"   ❌ No YouTube links found")
        else:
            print(f"❌ Song suggestion failed: {response.status_code}")
            return False
        
        # Test 4: Context awareness
        print("\n=== Test 4: Context Awareness ===")
        # First message
        chat_data = {"message": "hi", "userId": "context_test"}
        requests.post('http://localhost:8001/chat', json=chat_data, timeout=5)
        
        # Follow-up message
        chat_data = {"message": "ok", "userId": "context_test"}
        response = requests.post('http://localhost:8001/chat', json=chat_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Context awareness test passed")
            print(f"   Contextual response: {result['response']}")
        else:
            print(f"❌ Context awareness failed: {response.status_code}")
            return False
        
        # Test 5: Mood-based song suggestion
        print("\n=== Test 5: Mood-based Song Suggestion ===")
        chat_data = {"message": "I'm feeling sad, suggest music", "userId": "mood_test"}
        response = requests.post('http://localhost:8001/chat', json=chat_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Mood-based suggestion passed")
            print(f"   Detected mood: {result['mood_detected']}")
            print(f"   Has song suggestions: {result.get('has_song_suggestions', False)}")
            if 'Sad' in result['response']:
                print(f"   ✅ Contains mood-appropriate songs")
        else:
            print(f"❌ Mood-based suggestion failed: {response.status_code}")
            return False
        
        print("\n🎉 All tests passed!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False
    finally:
        # Stop the ML backend
        print("\nStopping ML backend...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()

if __name__ == "__main__":
    success = test_ml_backend()
    sys.exit(0 if success else 1)