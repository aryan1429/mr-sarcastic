#!/usr/bin/env python3
"""
YouTube Transcript Extractor for Fine-tuning
Extracts transcripts from YouTube videos and processes them for training
"""
import os
import json
import re
from typing import List, Dict, Optional
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from pytube import YouTube
import requests
from urllib.parse import urlparse, parse_qs

class YouTubeTranscriptExtractor:
    def __init__(self):
        self.processed_videos = []
        
    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
            r'youtube\.com\/v\/([a-zA-Z0-9_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    def get_transcript(self, video_id: str, languages=['en', 'en-US']) -> Optional[str]:
        """Get transcript for a YouTube video"""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get transcript in preferred languages
            for lang in languages:
                try:
                    transcript = transcript_list.find_transcript([lang])
                    transcript_data = transcript.fetch()
                    
                    # Combine all text
                    full_text = ' '.join([item['text'] for item in transcript_data])
                    return full_text.strip()
                except:
                    continue
                    
            # Try auto-generated transcript as fallback
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
                transcript_data = transcript.fetch()
                full_text = ' '.join([item['text'] for item in transcript_data])
                return full_text.strip()
            except:
                return None
                
        except NoTranscriptFound:
            return None
        except Exception as e:
            print(f"Error getting transcript for {video_id}: {str(e)}")
            return None

    def get_video_info(self, video_id: str) -> Dict:
        """Get video metadata"""
        try:
            yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
            return {
                'title': yt.title,
                'description': yt.description,
                'length': yt.length,
                'views': yt.views,
                'channel': yt.author
            }
        except Exception as e:
            print(f"Error getting video info for {video_id}: {str(e)}")
            return {}

    def clean_transcript(self, text: str) -> str:
        """Clean and process transcript text"""
        if not text:
            return ""
            
        # Remove timestamps and formatting
        text = re.sub(r'\[\d+:\d+\]', '', text)
        text = re.sub(r'\d+:\d+', '', text)
        
        # Fix common transcript issues
        text = text.replace('[Music]', '')
        text = text.replace('[Applause]', '')
        text = text.replace('[Laughter]', '')
        text = re.sub(r'\[.*?\]', '', text)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text

    def split_into_segments(self, text: str, max_length: int = 200) -> List[str]:
        """Split long transcript into meaningful segments"""
        if not text or len(text) <= max_length:
            return [text] if text else []
            
        # Split by sentences first
        sentences = re.split(r'[.!?]+', text)
        segments = []
        current_segment = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # If adding this sentence would exceed max length, save current segment
            if len(current_segment + " " + sentence) > max_length and current_segment:
                segments.append(current_segment.strip())
                current_segment = sentence
            else:
                current_segment = current_segment + " " + sentence if current_segment else sentence
                
        # Add the last segment
        if current_segment.strip():
            segments.append(current_segment.strip())
            
        return segments

    def create_training_pairs(self, segments: List[str], video_info: Dict) -> List[Dict]:
        """Create training prompt-completion pairs from transcript segments"""
        training_pairs = []
        
        # Templates for creating conversational training data
        templates = [
            {
                "prompt": "User: Explain this topic in a funny way\nChatbot:",
                "style": "humorous explanation"
            },
            {
                "prompt": "User: Make this more interesting\nChatbot:",
                "style": "engaging storytelling"
            },
            {
                "prompt": "User: Tell me about this\nChatbot:",
                "style": "sarcastic commentary"
            },
            {
                "prompt": "User: What's your take on this?\nChatbot:",
                "style": "witty response"
            },
            {
                "prompt": "User: Break this down for me\nChatbot:",
                "style": "casual explanation"
            }
        ]
        
        for segment in segments:
            if len(segment) < 20:  # Skip very short segments
                continue
                
            # Use different templates for variety
            for i, template in enumerate(templates):
                if i < len(segments) % len(templates) + 1:  # Don't use all templates for every segment
                    training_pairs.append({
                        "prompt": template["prompt"],
                        "completion": f" {segment}",
                        "source": "youtube",
                        "video_id": video_info.get('video_id', ''),
                        "channel": video_info.get('channel', ''),
                        "style": template["style"]
                    })
                    
        return training_pairs

    def process_video(self, url: str) -> List[Dict]:
        """Process a single YouTube video and return training data"""
        video_id = self.extract_video_id(url)
        if not video_id:
            print(f"❌ Could not extract video ID from: {url}")
            return []
            
        print(f"🎬 Processing video: {video_id}")
        
        # Get transcript
        transcript = self.get_transcript(video_id)
        if not transcript:
            print(f"❌ No transcript available for video: {video_id}")
            return []
            
        # Get video info
        video_info = self.get_video_info(video_id)
        video_info['video_id'] = video_id
        
        print(f"📝 Got transcript: {len(transcript)} characters")
        print(f"🎥 Title: {video_info.get('title', 'Unknown')}")
        
        # Clean and process transcript
        clean_text = self.clean_transcript(transcript)
        segments = self.split_into_segments(clean_text)
        
        print(f"✂️  Split into {len(segments)} segments")
        
        # Create training pairs
        training_pairs = self.create_training_pairs(segments, video_info)
        
        print(f"📚 Created {len(training_pairs)} training pairs")
        
        self.processed_videos.append({
            'url': url,
            'video_id': video_id,
            'title': video_info.get('title', ''),
            'channel': video_info.get('channel', ''),
            'training_pairs': len(training_pairs)
        })
        
        return training_pairs

    def process_video_list(self, urls: List[str], output_file: str = "youtube_training_data.jsonl") -> str:
        """Process multiple YouTube videos and create training dataset"""
        all_training_data = []
        
        print(f"🚀 Processing {len(urls)} YouTube videos...")
        print("=" * 60)
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing: {url}")
            try:
                training_pairs = self.process_video(url)
                all_training_data.extend(training_pairs)
            except Exception as e:
                print(f"❌ Error processing {url}: {str(e)}")
                continue
                
        # Save to JSONL file
        print(f"\n💾 Saving {len(all_training_data)} training pairs to {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            for pair in all_training_data:
                f.write(json.dumps(pair) + '\n')
                
        # Save processing summary
        summary_file = output_file.replace('.jsonl', '_summary.json')
        summary = {
            'total_videos': len(urls),
            'processed_videos': len(self.processed_videos),
            'total_training_pairs': len(all_training_data),
            'videos': self.processed_videos
        }
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
            
        print(f"📊 Processing summary saved to {summary_file}")
        print("\n✅ YouTube transcript extraction completed!")
        
        return output_file

def main():
    """Example usage"""
    extractor = YouTubeTranscriptExtractor()
    
    # Example YouTube Shorts URLs (replace with your actual URLs)
    sample_urls = [
        "https://www.youtube.com/shorts/example1",
        "https://www.youtube.com/shorts/example2",
        "https://www.youtube.com/watch?v=example3"
    ]
    
    print("YouTube Transcript Extractor for AI Training")
    print("=" * 50)
    print("📝 This tool extracts transcripts from YouTube videos")
    print("🎯 Perfect for training AI with humorous/sarcastic content")
    print("🎬 Works with YouTube Shorts and regular videos")
    print()
    
    # Process the videos
    output_file = extractor.process_video_list(sample_urls)
    
    print(f"\n🎉 Training data ready!")
    print(f"📁 File: {output_file}")
    print("🚀 You can now use this for fine-tuning!")
    print("\nNext steps:")
    print("1. Edit the URLs in this script with your actual YouTube Shorts")
    print("2. Run: python youtube_extractor.py")
    print("3. Use the generated .jsonl file for training")

if __name__ == "__main__":
    main()
