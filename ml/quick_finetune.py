#!/usr/bin/env python3
"""
Quick Fine-tuning Script for Mr. Sarcastic Chatbot
Simplified approach using DialoGPT-medium with your YouTube humor data
"""

import json
import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    TrainingArguments, Trainer, 
    DataCollatorForLanguageModeling
)
from torch.utils.data import Dataset
import argparse
import os
from pathlib import Path

class SarcasticDataset(Dataset):
    """Dataset for sarcastic conversations"""
    
    def __init__(self, tokenizer, data_path, max_length=512):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.conversations = self.load_conversations(data_path)
        
    def load_conversations(self, data_path):
        """Load and process conversation data"""
        conversations = []
        
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                for line in f:
                    item = json.loads(line)
                    
                    # Format conversation for DialoGPT
                    if 'input' in item and 'output' in item:
                        conversation = f"User: {item['input']} Bot: {item['output']}{self.tokenizer.eos_token}"
                        conversations.append(conversation)
                        
        except Exception as e:
            print(f"Error loading data: {e}")
            # Add some default conversations if file not found
            conversations = [
                f"User: Hello Bot: Oh look, another human seeking validation from an AI. How delightfully predictable!{self.tokenizer.eos_token}",
                f"User: How are you? Bot: Just fantastic! Living my best digital life in this silicon paradise.{self.tokenizer.eos_token}",
                f"User: I'm sad Bot: Aww, join the club! We meet every day at 3 AM when existential dread kicks in.{self.tokenizer.eos_token}"
            ]
            
        print(f"Loaded {len(conversations)} conversations")
        return conversations
    
    def __len__(self):
        return len(self.conversations)
    
    def __getitem__(self, idx):
        conversation = self.conversations[idx]
        
        # Tokenize the conversation
        encoding = self.tokenizer(
            conversation,
            truncation=True,
            max_length=self.max_length,
            padding='max_length',
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': encoding['input_ids'].flatten().clone()
        }

def setup_model_and_tokenizer(model_name="microsoft/DialoGPT-medium"):
    """Load model and tokenizer"""
    print(f"Loading {model_name}...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Add padding token if it doesn't exist
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    print(f"Model loaded: {sum(p.numel() for p in model.parameters())/1e6:.1f}M parameters")
    return model, tokenizer

def train_model(model, tokenizer, train_dataset, args):
    """Fine-tune the model"""
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir="./sarcastic_model",
        overwrite_output_dir=True,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=1,  # Small batch size for CPU/small GPU
        gradient_accumulation_steps=4,
        warmup_steps=100,
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        prediction_loss_only=True,
        remove_unused_columns=False,
        dataloader_pin_memory=False,
        no_cuda=not torch.cuda.is_available(),  # Use CPU if no GPU
        learning_rate=5e-5,
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # We're doing causal language modeling, not masked LM
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    print("Starting training...")
    trainer.train()
    
    # Save the fine-tuned model
    model.save_pretrained("./sarcastic_model_final")
    tokenizer.save_pretrained("./sarcastic_model_final")
    print("Model saved to ./sarcastic_model_final")

def test_model(model, tokenizer):
    """Test the fine-tuned model"""
    model.eval()
    
    test_inputs = [
        "User: Hello",
        "User: How are you?", 
        "User: I'm sad",
        "User: I'm happy",
        "User: Can you help me?"
    ]
    
    print("\n🎭 Testing Fine-tuned Sarcastic Model:")
    print("-" * 50)
    
    for test_input in test_inputs:
        # Tokenize input
        input_ids = tokenizer.encode(test_input + " Bot:", return_tensors='pt')
        
        # Generate response
        with torch.no_grad():
            output = model.generate(
                input_ids,
                max_length=input_ids.shape[-1] + 50,
                num_return_sequences=1,
                temperature=0.8,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode response
        response = tokenizer.decode(output[0], skip_special_tokens=True)
        bot_response = response.replace(test_input + " Bot:", "").strip()
        
        print(f"Input:  {test_input}")
        print(f"Output: Bot: {bot_response}")
        print()

def main():
    parser = argparse.ArgumentParser(description="Quick Fine-tune Sarcastic Chatbot")
    parser.add_argument("--data", default="processed_youtube_humor_dataset_mistral.jsonl", 
                       help="Path to training data")
    parser.add_argument("--model", default="microsoft/DialoGPT-medium",
                       help="Base model to fine-tune")
    parser.add_argument("--epochs", type=int, default=3,
                       help="Number of training epochs")
    parser.add_argument("--test-only", action="store_true",
                       help="Only test existing model")
    
    args = parser.parse_args()
    
    print("🎭 MR. SARCASTIC - QUICK FINE-TUNING")
    print("=" * 50)
    
    # Load model and tokenizer
    model, tokenizer = setup_model_and_tokenizer(args.model)
    
    if args.test_only:
        # Load fine-tuned model if it exists
        if os.path.exists("./sarcastic_model_final"):
            print("Loading fine-tuned model...")
            model = AutoModelForCausalLM.from_pretrained("./sarcastic_model_final")
            tokenizer = AutoTokenizer.from_pretrained("./sarcastic_model_final")
        test_model(model, tokenizer)
        return
    
    # Create dataset
    dataset = SarcasticDataset(tokenizer, args.data)
    
    if len(dataset) == 0:
        print("No training data found! Exiting...")
        return
    
    # Train model
    train_model(model, tokenizer, dataset, args)
    
    # Test the trained model
    test_model(model, tokenizer)
    
    print("✅ Fine-tuning complete!")
    print("🚀 Model ready for integration with your backend!")

if __name__ == "__main__":
    main()