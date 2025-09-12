#!/usr/bin/env python3
"""
Lightweight GPT-2 Training Script for Mr. Sarcastic
Uses YouTube transcript data and avoids heavy TensorFlow dependencies
"""

import os
import json
import torch
from typing import List, Dict, Optional
from transformers import GPT2Tokenizer, GPT2LMHeadModel, TextDataset, DataCollatorForLanguageModeling
from transformers import TrainingArguments, Trainer
import logging

# Suppress excessive logging
logging.getLogger("transformers").setLevel(logging.WARNING)

class SimpleYouTubeTrainer:
    """Lightweight GPT-2 trainer for YouTube transcripts"""

    def __init__(self, model_name: str = "gpt2"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🖥️ Using device: {self.device}")

    def load_model(self):
        """Load GPT-2 model and tokenizer"""
        print(f"🤖 Loading {self.model_name} model...")

        try:
            self.tokenizer = GPT2Tokenizer.from_pretrained(self.model_name)
            self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = GPT2LMHeadModel.from_pretrained(self.model_name)
            self.model.to(self.device)

            print(f"✅ Model loaded successfully")
            return True

        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

    def prepare_training_file(self, jsonl_file: str) -> str:
        """Convert JSONL to plain text training file"""
        print(f"📚 Preparing training file from {jsonl_file}...")
        
        training_file = "training_data.txt"
        
        with open(jsonl_file, 'r', encoding='utf-8') as f_in:
            with open(training_file, 'w', encoding='utf-8') as f_out:
                for line in f_in:
                    data = json.loads(line)
                    # Add special tokens for better training
                    text = data['text'] + self.tokenizer.eos_token
                    f_out.write(text + '\n')
        
        print(f"✅ Training file created: {training_file}")
        return training_file

    def create_dataset(self, training_file: str, block_size: int = 128):
        """Create dataset from text file"""
        print("📊 Creating dataset...")
        
        dataset = TextDataset(
            tokenizer=self.tokenizer,
            file_path=training_file,
            block_size=block_size,
        )
        
        print(f"✅ Dataset created with {len(dataset)} samples")
        return dataset

    def train(self, dataset_file: str, output_dir: str = "./youtube_gpt2_sarcastic", epochs: int = 3):
        """Train the model"""
        print("🚀 Starting training process...")

        # Prepare training file
        training_file = self.prepare_training_file(dataset_file)
        
        # Create dataset
        train_dataset = self.create_dataset(training_file)
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )

        # Training arguments - optimized for consumer hardware
        training_args = TrainingArguments(
            output_dir=output_dir,
            overwrite_output_dir=True,
            num_train_epochs=epochs,
            per_device_train_batch_size=2,  # Small batch size for limited RAM
            gradient_accumulation_steps=8,   # Simulate larger batches
            warmup_steps=50,
            learning_rate=5e-5,
            logging_steps=10,
            save_steps=100,
            save_total_limit=2,
            prediction_loss_only=True,
            remove_unused_columns=False,
            dataloader_num_workers=0,  # Avoid multiprocessing issues
            fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
        )

        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            data_collator=data_collator,
            train_dataset=train_dataset,
        )

        print(f"🎯 Training for {epochs} epochs...")
        trainer.train()

        # Save model
        trainer.save_model()
        self.tokenizer.save_pretrained(output_dir)

        # Cleanup
        os.remove(training_file)

        print(f"✅ Training completed! Model saved to {output_dir}")
        return output_dir

    def generate_response(self, prompt: str, max_length: int = 100, model_path: Optional[str] = None) -> str:
        """Generate a response from the trained model"""
        if model_path:
            # Load the trained model
            model = GPT2LMHeadModel.from_pretrained(model_path)
            tokenizer = GPT2Tokenizer.from_pretrained(model_path)
            model.to(self.device)
        else:
            model = self.model
            tokenizer = self.tokenizer

        if not model or not tokenizer:
            return "❌ Model not loaded!"

        # Encode input
        inputs = tokenizer.encode(prompt, return_tensors="pt").to(self.device)

        # Generate
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=len(inputs[0]) + max_length,
                num_return_sequences=1,
                temperature=0.8,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                no_repeat_ngram_size=2
            )

        # Decode response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Remove the input prompt from the response
        if response.startswith(prompt):
            response = response[len(prompt):].strip()
        
        return response

def test_model(trainer: SimpleYouTubeTrainer, model_path: str):
    """Test the trained model with sample inputs"""
    print("\n🧪 Testing the trained model:")
    print("=" * 40)
    
    test_prompts = [
        "Oh wow, let me explain this sarcastically: ",
        "Here's the deal with this shit: ",
        "You know what's funny about this? ",
        "User: How are you today?\nBot: ",
        "User: Tell me a joke\nBot: "
    ]
    
    for prompt in test_prompts:
        response = trainer.generate_response(prompt, max_length=50, model_path=model_path)
        print(f"💬 Prompt: {prompt}")
        print(f"🤖 Response: {response}")
        print()

def main():
    """Main training function"""
    print("🎬 YouTube GPT-2 Training for Mr. Sarcastic")
    print("=" * 50)
    
    # Check for dataset
    dataset_file = "youtube_humor_dataset.jsonl"
    if not os.path.exists(dataset_file):
        print(f"❌ Dataset file not found: {dataset_file}")
        print("💡 Run extract_youtube.py first to create the dataset")
        return
    
    # Count samples
    with open(dataset_file, 'r') as f:
        sample_count = sum(1 for line in f)
    
    print(f"📚 Found dataset with {sample_count} training samples")
    
    # Initialize trainer
    trainer = SimpleYouTubeTrainer()
    
    if not trainer.load_model():
        return
    
    # Train model
    output_dir = trainer.train(dataset_file, epochs=3)
    
    # Test the model
    test_choice = input("\n🧪 Test the trained model? (y/n): ").lower().strip()
    if test_choice == 'y':
        test_model(trainer, output_dir)
    
    print(f"\n🎉 Training complete!")
    print(f"📁 Model saved at: {output_dir}")
    print(f"🚀 Ready to integrate with your chatbot!")
    print(f"💡 Use the model path in your backend: {output_dir}")

if __name__ == "__main__":
    main()