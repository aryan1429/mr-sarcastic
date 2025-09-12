#!/usr/bin/env python3
"""
YouTube Training Script for Mr. Sarcastic (Lightweight GPT-2)
Trains on YouTube transcripts for sarcastic, humorous personality
"""

import os
import json
import torch
from typing import List, Dict, Optional
from transformers import (
    GPT2Tokenizer,
    GPT2LMHeadModel,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightYouTubeTrainer:
    """Lightweight GPT-2 trainer for YouTube transcripts"""

    def __init__(self, model_name: str = "gpt2"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self):
        """Load GPT-2 model and tokenizer"""
        print(f"🤖 Loading {self.model_name} model...")

        try:
            self.tokenizer = GPT2Tokenizer.from_pretrained(self.model_name)
            self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = GPT2LMHeadModel.from_pretrained(self.model_name)
            self.model.to(self.device)

            print(f"✅ Model loaded successfully on {self.device}")
            return True

        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

    def prepare_dataset(self, training_data: List[str]) -> Dataset:
        """Prepare dataset for training"""
        print("📚 Preparing dataset...")

        # Tokenize all texts
        tokenized_data = []
        for text in training_data:
            tokens = self.tokenizer(
                text,
                truncation=True,
                max_length=512,
                padding=False,
                return_tensors="pt"
            )
            tokenized_data.append({
                "input_ids": tokens["input_ids"].squeeze(),
                "attention_mask": tokens["attention_mask"].squeeze()
            })

        # Create dataset
        dataset = Dataset.from_list(tokenized_data)
        print(f"✅ Prepared dataset with {len(dataset)} samples")
        return dataset

    def train(self, dataset: Dataset, output_dir: str = "./youtube_gpt2_model"):
        """Train the model"""
        print("🚀 Starting training...")

        # Training arguments
        training_args = TrainingArguments(
            output_dir=output_dir,
            overwrite_output_dir=True,
            num_train_epochs=3,
            per_device_train_batch_size=2,
            save_steps=500,
            save_total_limit=2,
            logging_steps=100,
            learning_rate=5e-5,
            weight_decay=0.01,
            warmup_steps=100,
            gradient_accumulation_steps=4,
            fp16=torch.cuda.is_available(),
            dataloader_num_workers=0,
        )

        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )

        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            data_collator=data_collator,
            train_dataset=dataset,
        )

        # Train
        trainer.train()

        # Save model
        trainer.save_model(output_dir)
        self.tokenizer.save_pretrained(output_dir)

        print(f"✅ Model saved to {output_dir}")
        return output_dir

    def generate_response(self, prompt: str, max_length: int = 100) -> str:
        """Generate a response from the trained model"""
        if not self.model or not self.tokenizer:
            return "Model not loaded!"

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                num_return_sequences=1,
                no_repeat_ngram_size=2,
                temperature=0.8,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response[len(prompt):].strip()

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

            # Get transcript using the correct API
            fetched_transcript = self.youtube_transcript_api.fetch(video_id, languages=['en'])

            # Extract text from snippets
            full_text = " ".join([snippet.text for snippet in fetched_transcript.snippets])

            return {
                'text': full_text,
                'video_id': video_id,
                'duration': sum([snippet.duration for snippet in fetched_transcript.snippets]),
                'language': fetched_transcript.language_code
            }

        except Exception as e:
            print(f"❌ Error extracting transcript: {e}")
            return None

    def clean_transcript(self, transcript_data: Dict) -> str:
        """Clean and format transcript text"""
        text = transcript_data['text']

        # Basic cleaning
        text = text.replace('\n', ' ')
        text = ' '.join(text.split())  # Remove extra spaces

        # Remove timestamps and formatting artifacts
        text = text.replace('[Music]', '').replace('[Applause]', '')

        return text.strip()

def create_humor_training_pairs(transcript: str, video_info: Dict) -> List[str]:
    """Create training pairs focused on humor and sarcasm"""
    if len(transcript) < 50:
        return []

    # Split into segments
    segments = split_transcript_smartly(transcript)
    training_texts = []

    # Sarcastic/humorous prefixes
    prefixes = [
        "Oh wow, let me explain this sarcastically: ",
        "Here's the deal with this: ",
        "You know what's funny about this? ",
        "Let me break this down for you: ",
        "Here's my take on this nonsense: ",
        "Oh great, another thing to explain: ",
        "Buckle up, this is going to be interesting: ",
        "Alright, listen up: ",
        "You won't believe this: ",
        "Here's the truth about this: "
    ]

    for segment in segments:
        if len(segment.strip()) < 30:
            continue

        # Create multiple variations
        for prefix in prefixes[:3]:  # Use first 3 prefixes for variety
            training_text = f"{prefix}{segment}"
            training_texts.append(training_text)

    return training_texts

def split_transcript_smartly(text: str, max_segment_length: int = 150) -> List[str]:
    """Split transcript into meaningful segments"""
    if len(text) <= max_segment_length:
        return [text]

    # Try to split by sentences first
    import re
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

def create_lightweight_training_dataset(urls: List[str]) -> Optional[str]:
    """Create training dataset from YouTube URLs"""
    print("🎬 Creating training dataset from YouTube...")

    # Initialize extractor
    extractor = YouTubeTranscriptExtractor()
    if not extractor.load_api():
        return None

    all_training_data = []

    for i, url in enumerate(urls, 1):
        print(f"📹 Processing video {i}/{len(urls)}: {url[:50]}...")

        try:
            # Extract transcript
            transcript_data = extractor.extract_transcript(url)
            if not transcript_data:
                continue

            # Clean transcript
            clean_text = extractor.clean_transcript(transcript_data)

            # Create training pairs
            training_pairs = create_humor_training_pairs(clean_text, transcript_data)
            all_training_data.extend(training_pairs)

            print(f"📚 Created {len(training_pairs)} training samples")

        except Exception as e:
            print(f"❌ Error processing {url}: {str(e)}")
            continue

    if not all_training_data:
        print("❌ No training data created!")
        return None

    # Save training data
    dataset_file = "youtube_humor_dataset.jsonl"
    with open(dataset_file, 'w', encoding='utf-8') as f:
        for text in all_training_data:
            f.write(json.dumps({"text": text}) + '\n')

    print(f"\n✅ Created dataset with {len(all_training_data)} training samples")
    print(f"📁 Saved to: {dataset_file}")

    return dataset_file

def main():
    """Main training function"""
    print("🎬 YouTube Training for Mr. Sarcastic (GPT-2)")
    print("=" * 50)

    # Check for YouTube URLs
    urls = []
    if os.path.exists("youtube_urls.txt"):
        with open("youtube_urls.txt", "r") as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]

    if not urls:
        print("❌ No YouTube URLs found!")
        print("💡 Create youtube_urls.txt with YouTube video URLs")
        return

    print(f"📹 Found {len(urls)} YouTube videos to process")

    # Create training dataset
    dataset_file = create_lightweight_training_dataset(urls)

    if not dataset_file:
        print("❌ Failed to create training dataset")
        return

    # Load training data
    training_data = []
    with open(dataset_file, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            training_data.append(data['text'])

    print(f"📚 Loaded {len(training_data)} training samples")

    # Initialize trainer
    trainer = LightYouTubeTrainer()

    if not trainer.load_model():
        return

    # Prepare dataset
    dataset = trainer.prepare_dataset(training_data)

    # Train model
    model_dir = trainer.train(dataset)

    print("\n🎯 Training completed!")
    print(f"📁 Model saved to: {model_dir}")
    print(f"🚀 Ready to integrate into your chatbot!")

    # Test the model
    test_choice = input("\n🧪 Test the trained model? (y/n): ").lower()
    if test_choice == 'y':
        print("\n🎪 Testing trained model:")
        print("=" * 30)

        test_prompts = [
            "Oh wow, let me explain this sarcastically: ",
            "Here's the deal with this: ",
            "You know what's funny about this? "
        ]

        for prompt in test_prompts:
            response = trainer.generate_response(prompt, max_length=50)
            print(f"🤖 {prompt}{response}")
            print()

if __name__ == "__main__":
    main()
