#!/usr/bin/env python3
"""
YouTube Transcript Extractor for Mr. Sarcastic
Simple script to extract and prepare training data from YouTube videos
"""

import os
import json
import re
from typing import List, Dict, Optional

class YouTubeTranscriptExtractor:
    """Extract and clean YouTube transcripts"""

    def __init__(self):
        self.youtube_transcript_api = None

    def load_api(self):
        """Load YouTube transcript API"""
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            self.youtube_transcript_api = YouTubeTranscriptApi()
            return True
        except ImportError:
            print("❌ youtube-transcript-api not installed")
            print("💡 Run: pip install youtube-transcript-api")
            return False

    def extract_transcript(self, url: str) -> Optional[Dict]:
        """Extract transcript from YouTube URL"""
        if not self.youtube_transcript_api:
            return None

        try:
            # Extract video ID from various YouTube URL formats
            if "youtu.be/" in url:
                video_id = url.split("youtu.be/")[1].split("?")[0]
            elif "youtube.com/watch?v=" in url:
                video_id = url.split("v=")[1].split("&")[0]
            elif "youtube.com/shorts/" in url:
                video_id = url.split("shorts/")[1].split("?")[0]
            else:
                print(f"❌ Invalid YouTube URL: {url}")
                return None

            print(f"🎯 Extracting transcript for video ID: {video_id}")

            # Get transcript using the correct API
            fetched_transcript = self.youtube_transcript_api.fetch(video_id, languages=['en'])

            # Extract text from snippets
            full_text = " ".join([snippet.text for snippet in fetched_transcript.snippets])

            return {
                'text': full_text,
                'video_id': video_id,
                'duration': sum([snippet.duration for snippet in fetched_transcript.snippets]),
                'language': fetched_transcript.language_code,
                'url': url
            }

        except Exception as e:
            print(f"❌ Error extracting transcript from {url}: {e}")
            return None

    def clean_transcript(self, transcript_data: Dict) -> str:
        """Clean and format transcript text"""
        text = transcript_data['text']

        # Basic cleaning
        text = text.replace('\n', ' ')
        text = ' '.join(text.split())  # Remove extra spaces

        # Remove timestamps and formatting artifacts
        text = text.replace('[Music]', '').replace('[Applause]', '')
        text = text.replace('[ __ ]', 'fuck')  # Replace censored words

        return text.strip()

def create_humor_training_pairs(transcript: str, video_info: Dict) -> List[str]:
    """Create training pairs focused on humor and sarcasm"""
    if len(transcript) < 50:
        return []

    # Split into segments
    segments = split_transcript_smartly(transcript)
    training_texts = []

    # Sarcastic/humorous prefixes for training
    prefixes = [
        "Oh wow, let me explain this sarcastically: ",
        "Here's the deal with this shit: ",
        "You know what's funny about this? ",
        "Let me break this down for you: ",
        "Here's my take on this nonsense: ",
        "Oh great, another thing to explain: ",
        "Buckle up, this is going to be interesting: ",
        "Alright, listen up: ",
        "You won't believe this crap: ",
        "Here's the truth about this: ",
        "Well, isn't this fucking brilliant: ",
        "Oh, this is rich: "
    ]

    for segment in segments:
        if len(segment.strip()) < 30:
            continue

        # Create multiple variations with different prefixes
        for prefix in prefixes[:4]:  # Use first 4 prefixes for variety
            training_text = f"{prefix}{segment}"
            training_texts.append(training_text)
            
        # Also add the raw segment for diversity
        training_texts.append(segment)

    return training_texts

def split_transcript_smartly(text: str, max_segment_length: int = 150) -> List[str]:
    """Split transcript into meaningful segments"""
    if len(text) <= max_segment_length:
        return [text]

    # Try to split by sentences first
    sentences = re.split(r'[.!?]+', text)
    segments = []
    current_segment = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if len(current_segment + " " + sentence) <= max_segment_length:
            current_segment = (current_segment + " " + sentence).strip()
        else:
            if current_segment:
                segments.append(current_segment)
            current_segment = sentence

    if current_segment:
        segments.append(current_segment)

    return [seg for seg in segments if len(seg.strip()) > 20]

def create_training_dataset(urls: List[str]) -> Optional[str]:
    """Create training dataset from YouTube URLs"""
    print("🎬 Creating training dataset from YouTube...")

    # Initialize extractor
    extractor = YouTubeTranscriptExtractor()
    if not extractor.load_api():
        return None

    all_training_data = []
    successful_extractions = 0

    for i, url in enumerate(urls, 1):
        print(f"\n📹 Processing video {i}/{len(urls)}")
        print(f"🔗 URL: {url}")

        try:
            # Extract transcript
            transcript_data = extractor.extract_transcript(url)
            if not transcript_data:
                print("❌ Failed to extract transcript")
                continue

            # Clean transcript
            clean_text = extractor.clean_transcript(transcript_data)
            print(f"📝 Extracted {len(clean_text)} characters")
            print(f"⏱️ Duration: {transcript_data['duration']:.1f} seconds")

            # Create training pairs
            training_pairs = create_humor_training_pairs(clean_text, transcript_data)
            all_training_data.extend(training_pairs)

            print(f"📚 Created {len(training_pairs)} training samples")
            successful_extractions += 1

        except Exception as e:
            print(f"❌ Error processing {url}: {str(e)}")
            continue

    if not all_training_data:
        print("\n❌ No training data created!")
        return None

    # Save training data
    dataset_file = "youtube_humor_dataset.jsonl"
    with open(dataset_file, 'w', encoding='utf-8') as f:
        for text in all_training_data:
            f.write(json.dumps({"text": text}) + '\n')

    print(f"\n✅ Success! Created dataset with {len(all_training_data)} training samples")
    print(f"📁 Saved to: {dataset_file}")
    print(f"🎯 Successfully processed {successful_extractions}/{len(urls)} videos")

    return dataset_file

def preview_dataset(dataset_file: str, num_samples: int = 5):
    """Preview some samples from the dataset"""
    print(f"\n👀 Previewing first {num_samples} samples from {dataset_file}:")
    print("=" * 60)
    
    with open(dataset_file, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if i >= num_samples:
                break
            data = json.loads(line)
            print(f"Sample {i+1}: {data['text'][:100]}...")
            print()

def main():
    """Main function"""
    print("🎬 YouTube Transcript Extractor for Mr. Sarcastic")
    print("=" * 55)

    # Check for YouTube URLs
    urls = []
    if os.path.exists("youtube_urls.txt"):
        with open("youtube_urls.txt", "r") as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]

    if not urls:
        print("❌ No YouTube URLs found!")
        print("💡 Create youtube_urls.txt with YouTube video URLs (one per line)")
        print("Example content:")
        print("https://youtube.com/shorts/oqFQsGvRRkk")
        print("https://www.youtube.com/watch?v=example")
        return

    print(f"📹 Found {len(urls)} YouTube videos to process")

    # Create training dataset
    dataset_file = create_training_dataset(urls)

    if dataset_file:
        # Preview the dataset
        preview_dataset(dataset_file)
        
        print("\n🎯 Next steps:")
        print("1. Review the generated dataset file")
        print("2. Add more YouTube URLs if needed")
        print("3. Run model training (once we set up the lightweight trainer)")
        
    else:
        print("❌ Failed to create training dataset")

if __name__ == "__main__":
    main()