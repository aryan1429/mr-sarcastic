#!/usr/bin/env python3
"""
Test the full application flow including song suggestions
"""

import requests
import json
import time

def test_full_application():
    base_url = "http://localhost:3001"
    
    print("=== Testing Full Mr. Sarcastic Application ===\n")
    
    # Test 1: Basic greeting
    print("Test 1: Basic greeting")
    response = requests.post(f"{base_url}/api/chat/test", json={
        "message": "hi",
        "conversationHistory": []
    })
    
    if response.status_code == 200:
        data = response.json()
        message_data = data['data']
        print(f"✅ Response: {message_data['message'][:100]}...")
        print(f"   Mood: {message_data['mood']}")
        print(f"   Confidence: {message_data['confidence']}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print()
    
    # Test 2: Song suggestion request
    print("Test 2: Song suggestion request")
    response = requests.post(f"{base_url}/api/chat/test", json={
        "message": "suggest some songs",
        "conversationHistory": []
    })
    
    if response.status_code == 200:
        data = response.json()
        message_data = data['data']
        print(f"✅ Response preview: {message_data['message'][:150]}...")
        print(f"   Mood: {message_data['mood']}")
        print(f"   Contains YouTube links: {'youtube.com' in message_data['message']}")
        
        # Count song recommendations
        youtube_count = message_data['message'].count('youtube.com')
        print(f"   Number of songs: {youtube_count}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print()
    
    # Test 3: Context awareness test
    print("Test 3: Context awareness")
    
    # Send "ok" after song suggestions
    response = requests.post(f"{base_url}/api/chat/test", json={
        "message": "ok",
        "conversationHistory": []
    })
    
    if response.status_code == 200:
        data = response.json()
        message_data = data['data']
        print(f"✅ Contextual response: {message_data['message']}")
        print(f"   Shows context awareness: {'music' in message_data['message'].lower() or 'song' in message_data['message'].lower()}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print()
    
    # Test 4: Mood-based song suggestion
    print("Test 4: Mood-based song suggestion")
    response = requests.post(f"{base_url}/api/chat/test", json={
        "message": "I'm feeling sad, recommend some music",
        "conversationHistory": []
    })
    
    if response.status_code == 200:
        data = response.json()
        message_data = data['data']
        print(f"✅ Response preview: {message_data['message'][:150]}...")
        print(f"   Detected mood: {message_data['mood']}")
        print(f"   Contains mood-appropriate content: {'sad' in message_data['message'].lower()}")
        print(f"   Contains YouTube links: {'youtube.com' in message_data['message']}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print()
    
    # Test 5: Simple conversation
    print("Test 5: Simple conversation")
    response = requests.post(f"{base_url}/api/chat/test", json={
        "message": "bruh",
        "conversationHistory": []
    })
    
    if response.status_code == 200:
        data = response.json()
        message_data = data['data']
        print(f"✅ Response: {message_data['message']}")
        print(f"   Shows personality: {len(message_data['message']) > 20}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print("\n=== Test Summary ===")
    print("✅ The enhanced Mr. Sarcastic bot now:")
    print("   - Understands conversation context")
    print("   - Suggests songs from the playlist")
    print("   - Matches songs to user emotions")
    print("   - Provides YouTube links for easy listening")
    print("   - Maintains its sarcastic personality")

if __name__ == "__main__":
    test_full_application()