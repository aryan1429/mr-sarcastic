#!/usr/bin/env python3
"""
YouTube Fine-tuning Script for Mr. Sarcastic
"""
import json
import os
from youtube_extractor import YouTubeTranscriptExtractor
from fine_tune_falcon import FalconFineTuner

def train_from_youtube_videos():
    """Extract YouTube content and train the model"""
    
    print("🎬 YouTube Fine-tuning for Mr. Sarcastic")
    print("=" * 50)
    
    # Add your YouTube Shorts URLs here
    youtube_urls = [
        # Replace these with your actual YouTube Shorts URLs
        "https://www.youtube.com/shorts/dQw4w9WgXcQ",  # Example URL
        # Add more URLs here:
        # "https://www.youtube.com/shorts/your_video_1",
        # "https://www.youtube.com/shorts/your_video_2",
        # "https://www.youtube.com/watch?v=your_video_3",
    ]
    
    if not any(url for url in youtube_urls if not url.startswith("#") and "example" not in url.lower()):
        print("⚠️  No valid YouTube URLs found!")
        print("📝 Please edit this script and add your YouTube Shorts URLs")
        print("💡 Replace the example URLs with actual video URLs")
        return
    
    # Step 1: Extract transcripts from YouTube videos
    print("\n📥 Step 1: Extracting YouTube transcripts...")
    extractor = YouTubeTranscriptExtractor()
    
    try:
        training_file = extractor.process_video_list(
            youtube_urls, 
            "youtube_humor_training.jsonl"
        )
    except Exception as e:
        print(f"❌ Error extracting YouTube content: {str(e)}")
        print("💡 Make sure the YouTube URLs are valid and have transcripts")
        return
    
    # Step 2: Combine with existing humor data
    print("\n🔗 Step 2: Combining with existing training data...")
    combined_data = []
    
    # Load existing humor data
    existing_file = "humor_dataset.jsonl"
    if os.path.exists(existing_file):
        with open(existing_file, 'r', encoding='utf-8') as f:
            for line in f:
                combined_data.append(json.loads(line))
        print(f"📚 Loaded {len(combined_data)} existing training examples")
    
    # Load YouTube data
    youtube_count = 0
    if os.path.exists(training_file):
        with open(training_file, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                # Convert to standard format
                combined_data.append({
                    "prompt": data["prompt"],
                    "completion": data["completion"]
                })
                youtube_count += 1
        print(f"🎬 Added {youtube_count} YouTube-based training examples")
    
    # Save combined dataset
    combined_file = "combined_humor_dataset.jsonl"
    with open(combined_file, 'w', encoding='utf-8') as f:
        for item in combined_data:
            f.write(json.dumps(item) + '\n')
    
    print(f"💾 Combined dataset saved: {len(combined_data)} total examples")
    
    # Step 3: Train the model
    print("\n🧠 Step 3: Training the model...")
    fine_tuner = FalconFineTuner()
    
    try:
        # Load the model
        fine_tuner.load_model()
        
        # Train with combined dataset
        output_dir = "./falcon-youtube-humor-chatbot"
        fine_tuner.train(
            dataset_path=combined_file,
            output_dir=output_dir,
            max_steps=500  # Adjust based on your dataset size
        )
        
        print("✅ Training completed!")
        
        # Step 4: Test the model
        print("\n🧪 Step 4: Testing the YouTube-trained model...")
        test_prompts = [
            "Explain artificial intelligence in a funny way",
            "What's your take on social media?",
            "Make learning more interesting",
            "Break down this complex topic for me",
            "Tell me about technology trends"
        ]
        
        for prompt in test_prompts:
            response = fine_tuner.generate_response(
                prompt,
                model_path=output_dir
            )
            print(f"\n👤 User: {prompt}")
            print(f"🤖 Bot: {response}")
        
        print(f"\n🎉 YouTube fine-tuning completed!")
        print(f"📁 Model saved to: {output_dir}")
        print("🚀 Your AI now has YouTube-learned humor!")
        
    except Exception as e:
        print(f"❌ Training failed: {str(e)}")
        print("💡 Try reducing max_steps or ensure you have enough RAM")

def add_youtube_urls_interactive():
    """Interactive function to add YouTube URLs"""
    print("🎬 YouTube URL Collection")
    print("=" * 30)
    print("📝 Enter your YouTube Shorts URLs (one at a time)")
    print("💡 Press Enter with empty line to finish")
    print("🎯 Focus on videos with humorous AI voices!")
    print()
    
    urls = []
    while True:
        url = input(f"URL #{len(urls) + 1} (or press Enter to finish): ").strip()
        if not url:
            break
        if "youtube.com" in url or "youtu.be" in url:
            urls.append(url)
            print(f"✅ Added: {url}")
        else:
            print("❌ Invalid YouTube URL, try again")
    
    if urls:
        # Save URLs to a file for later use
        with open("youtube_urls.txt", "w") as f:
            for url in urls:
                f.write(url + "\n")
        
        print(f"\n💾 Saved {len(urls)} URLs to youtube_urls.txt")
        print("🚀 Run the training with these URLs!")
        return urls
    else:
        print("❌ No URLs added")
        return []

def main():
    """Main function with options"""
    print("🎯 YouTube Fine-tuning for Mr. Sarcastic")
    print("=" * 50)
    print("Choose an option:")
    print("1. 🎬 Add YouTube URLs interactively")
    print("2. 🚀 Start training with existing URLs")
    print("3. 📋 Show example usage")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        urls = add_youtube_urls_interactive()
        if urls:
            proceed = input("\n🚀 Start training now? (y/n): ").lower()
            if proceed == 'y':
                train_from_youtube_videos()
    
    elif choice == "2":
        train_from_youtube_videos()
    
    elif choice == "3":
        show_example_usage()
    
    else:
        print("❌ Invalid choice")

def show_example_usage():
    """Show example usage instructions"""
    print("\n📋 Example Usage:")
    print("=" * 30)
    print("1. 🎬 Find YouTube Shorts with humorous AI voices")
    print("2. 📝 Copy their URLs")
    print("3. 🔧 Edit youtube_train.py and add URLs to the list")
    print("4. 🚀 Run: python youtube_train.py")
    print()
    print("🎯 Good video types for training:")
    print("• AI explanation videos with humor")
    print("• Sarcastic commentary videos")
    print("• Educational content with jokes")
    print("• Tech reviews with personality")
    print()
    print("💡 The more videos, the better the personality!")

if __name__ == "__main__":
    main()
