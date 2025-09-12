#!/usr/bin/env python3
"""
YouTube URL Collection Tool
Simple tool to collect and validate YouTube URLs for training
"""
import re
import json
from typing import List
import os

def validate_youtube_url(url: str) -> bool:
    """Validate if URL is a proper YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        if re.search(pattern, url):
            return True
    return False

def extract_video_id(url: str) -> str:
    """Extract video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ""

def collect_urls_interactive() -> List[str]:
    """Collect YouTube URLs interactively"""
    print("🎬 YouTube URL Collector for AI Training")
    print("=" * 50)
    print("📝 Tips for choosing good videos:")
    print("• 🎯 Look for AI voices with humor/sarcasm")
    print("• 🎪 Educational content with personality") 
    print("• 😄 Commentary videos with jokes")
    print("• 🎭 Shorts with entertaining explanations")
    print()
    print("📋 Enter URLs one by one (press Enter on empty line to finish):")
    print()
    
    urls = []
    video_ids = set()
    
    while True:
        try:
            url = input(f"URL #{len(urls) + 1}: ").strip()
            
            if not url:  # Empty input means done
                break
                
            if validate_youtube_url(url):
                video_id = extract_video_id(url)
                
                if video_id in video_ids:
                    print(f"⚠️  Duplicate video, skipping...")
                    continue
                    
                urls.append(url)
                video_ids.add(video_id)
                print(f"✅ Added: {video_id} - {len(urls)} total")
                
            else:
                print(f"❌ Invalid YouTube URL. Please try again.")
                print(f"💡 Example: https://youtube.com/shorts/VIDEO_ID")
                
        except KeyboardInterrupt:
            print(f"\n\n⏹️  Stopped by user")
            break
            
    return urls

def save_urls_to_files(urls: List[str]):
    """Save URLs to multiple formats"""
    if not urls:
        print("❌ No URLs to save")
        return
    
    # Save as simple text file
    with open("youtube_urls.txt", "w", encoding='utf-8') as f:
        for url in urls:
            f.write(url + "\n")
    
    # Save as JSON for programmatic use
    with open("youtube_urls.json", "w", encoding='utf-8') as f:
        json.dump({"urls": urls, "count": len(urls)}, f, indent=2)
    
    # Create a ready-to-use Python script
    script_content = f'''#!/usr/bin/env python3
"""
Auto-generated YouTube URLs for training
Generated with {len(urls)} video URLs
"""

# YouTube URLs for training Mr. Sarcastic
YOUTUBE_URLS = [
'''
    
    for url in urls:
        script_content += f'    "{url}",\n'
    
    script_content += ''']

# Usage:
# from youtube_urls_config import YOUTUBE_URLS
# Use YOUTUBE_URLS in your training script
'''
    
    with open("youtube_urls_config.py", "w", encoding='utf-8') as f:
        f.write(script_content)
    
    print(f"✅ Saved {len(urls)} URLs to:")
    print(f"📄 youtube_urls.txt - Simple text format")
    print(f"📊 youtube_urls.json - JSON format")
    print(f"🐍 youtube_urls_config.py - Python script")

def load_existing_urls() -> List[str]:
    """Load existing URLs from file"""
    urls = []
    
    if os.path.exists("youtube_urls.txt"):
        try:
            with open("youtube_urls.txt", "r", encoding='utf-8') as f:
                urls = [line.strip() for line in f if line.strip()]
            print(f"📂 Loaded {len(urls)} existing URLs")
        except Exception as e:
            print(f"❌ Error loading existing URLs: {e}")
    
    return urls

def show_statistics(urls: List[str]):
    """Show statistics about collected URLs"""
    if not urls:
        print("📊 No URLs collected yet")
        return
    
    shorts_count = sum(1 for url in urls if "/shorts/" in url)
    regular_count = len(urls) - shorts_count
    
    print(f"\n📊 Collection Statistics:")
    print(f"📹 Total videos: {len(urls)}")
    print(f"🎬 YouTube Shorts: {shorts_count}")
    print(f"📺 Regular videos: {regular_count}")
    print(f"🎯 Ready for training!")

def main():
    """Main function"""
    print("🎬 YouTube URL Collection Tool")
    print("=" * 40)
    
    # Load existing URLs
    existing_urls = load_existing_urls()
    if existing_urls:
        print(f"📂 Found {len(existing_urls)} existing URLs")
        choice = input("Add more URLs to existing collection? (y/n): ").lower()
        if choice != 'y':
            show_statistics(existing_urls)
            return
    
    # Collect new URLs
    new_urls = collect_urls_interactive()
    
    if not new_urls and not existing_urls:
        print("❌ No URLs collected. Exiting.")
        return
    
    # Combine URLs
    all_urls = existing_urls + new_urls
    
    # Remove duplicates while preserving order
    unique_urls = []
    seen = set()
    for url in all_urls:
        video_id = extract_video_id(url)
        if video_id not in seen:
            unique_urls.append(url)
            seen.add(video_id)
    
    if len(all_urls) != len(unique_urls):
        print(f"🔄 Removed {len(all_urls) - len(unique_urls)} duplicate(s)")
    
    # Save URLs
    save_urls_to_files(unique_urls)
    show_statistics(unique_urls)
    
    # Offer to start training
    if unique_urls:
        print(f"\n🚀 Next steps:")
        print(f"1. Review your URLs in youtube_urls.txt")
        print(f"2. Run training: python youtube_train.py")
        print(f"3. Test your humor-trained AI!")
        
        start_training = input(f"\nStart training now? (y/n): ").lower()
        if start_training == 'y':
            print(f"\n🎯 Starting YouTube-based training...")
            try:
                from youtube_train import train_from_youtube_videos
                train_from_youtube_videos()
            except ImportError:
                print(f"❌ Training script not found. Run manually: python youtube_train.py")

if __name__ == "__main__":
    main()
