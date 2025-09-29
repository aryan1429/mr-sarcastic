#!/usr/bin/env python3
"""
Test script for the enhanced ML backend
"""
import requests
import json

# Test the health endpoint
try:
    print("Testing health endpoint...")
    response = requests.get('http://localhost:8001/health')
    print(f"Health Status: {response.status_code}")
    if response.status_code == 200:
        health_data = response.json()
        print(f"Service Status: {health_data['status']}")
        print(f"Songs Loaded: {health_data['model_status']['songs_loaded']}")
        print(f"Context Aware: {health_data['model_status']['context_aware']}")
    print()
except Exception as e:
    print(f"Health check failed: {e}")
    print()

# Test basic chat
try:
    print("Testing basic chat...")
    chat_data = {
        "message": "hi",
        "userId": "test_user"
    }
    response = requests.post('http://localhost:8001/chat', 
                           json=chat_data,
                           headers={'Content-Type': 'application/json'})
    print(f"Chat Status: {response.status_code}")
    if response.status_code == 200:
        chat_response = response.json()
        print(f"Response: {chat_response['response']}")
        print(f"Mood Detected: {chat_response['mood_detected']}")
        print(f"Source: {chat_response['source']}")
    print()
except Exception as e:
    print(f"Basic chat test failed: {e}")
    print()

# Test song suggestion
try:
    print("Testing song suggestion...")
    chat_data = {
        "message": "suggest some songs",
        "userId": "test_user"
    }
    response = requests.post('http://localhost:8001/chat', 
                           json=chat_data,
                           headers={'Content-Type': 'application/json'})
    print(f"Song Request Status: {response.status_code}")
    if response.status_code == 200:
        chat_response = response.json()
        print(f"Response: {chat_response['response'][:200]}...")  # Truncate long response
        print(f"Has Song Suggestions: {chat_response.get('has_song_suggestions', False)}")
        print(f"Mood Detected: {chat_response['mood_detected']}")
    print()
except Exception as e:
    print(f"Song suggestion test failed: {e}")
    print()

# Test context awareness
try:
    print("Testing context awareness...")
    # Send a simple message first
    chat_data = {
        "message": "hi",
        "userId": "context_test_user"
    }
    requests.post('http://localhost:8001/chat', json=chat_data)
    
    # Then send a follow-up
    chat_data = {
        "message": "ok",
        "userId": "context_test_user"
    }
    response = requests.post('http://localhost:8001/chat', json=chat_data)
    print(f"Context Test Status: {response.status_code}")
    if response.status_code == 200:
        chat_response = response.json()
        print(f"Contextual Response: {chat_response['response']}")
    print()
except Exception as e:
    print(f"Context test failed: {e}")