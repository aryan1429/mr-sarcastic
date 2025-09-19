#!/usr/bin/env python3
"""
Simplified Training Script for Sarcastic Chatbot - PyTorch Only
Avoids TensorFlow dependencies and focuses on pure PyTorch fine-tuning
"""

import os
import sys
import json
import time
import logging
import torch
from pathlib import Path
from typing import Optional, Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import transformers with error handling
try:
    os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"  # Disable TensorFlow optimizations
    import transformers
    transformers.logging.set_verbosity_error()  # Reduce transformers logging
    
    from transformers import (
        AutoModelForCausalLM, 
        AutoTokenizer, 
        DataCollatorForLanguageModeling, 
        Trainer, 
        TrainingArguments
    )
    from datasets import Dataset
    TRANSFORMERS_AVAILABLE = True
    logger.info("✅ Transformers library loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load transformers: {e}")
    TRANSFORMERS_AVAILABLE = False

class SimpleSarcasticTrainer:
    """Simplified trainer focusing on PyTorch-only training"""
    
    MODELS = {
        "dialogpt-medium": "microsoft/DialoGPT-medium",
        "dialogpt-large": "microsoft/DialoGPT-large", 
        "mistral-7b": "mistralai/Mistral-7B-Instruct-v0.1",
        "falcon-7b": "tiiuae/falcon-7b-instruct", 
        "llama2-7b": "meta-llama/Llama-2-7b-chat-hf",
        "gpt2-xl": "gpt2-xl"
    }
    
    def __init__(self, model_key="mistral-7b"):
        self.model_key = model_key
        self.model_name = self.MODELS.get(model_key, self.MODELS["mistral-7b"])
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model = None
        
        logger.info(f"🤖 Initializing trainer with {model_key}")
        logger.info(f"📱 Device: {self.device}")
        if torch.cuda.is_available():
            logger.info(f"🚀 GPU: {torch.cuda.get_device_name(0)}")
        
    def load_model(self):
        """Load model and tokenizer"""
        if not TRANSFORMERS_AVAILABLE:
            logger.error("❌ Transformers not available")
            return False
            
        try:
            logger.info(f"🔄 Loading {self.model_name}...")
            start_time = time.time()
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                use_fast=True
            )
            
            # Add padding token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                low_cpu_mem_usage=True
            )
            
            if not torch.cuda.is_available():
                self.model = self.model.to(self.device)
                
            load_time = time.time() - start_time
            param_count = sum(p.numel() for p in self.model.parameters())
            
            logger.info(f"✅ Model loaded in {load_time:.1f}s")
            logger.info(f"📊 Parameters: {param_count:,}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            return False
    
    def prepare_dataset(self, data_file):
        """Load and prepare training dataset"""
        try:
            logger.info(f"📂 Loading training data from {data_file}")
            
            with open(data_file, 'r', encoding='utf-8') as f:
                data = [json.loads(line) for line in f]
            
            logger.info(f"📊 Loaded {len(data)} training examples")
            
            # Convert to HuggingFace dataset
            dataset = Dataset.from_list(data)
            
            # Tokenize based on model type
            def tokenize_function(examples):
                if "instruction" in examples and "input" in examples and "output" in examples:
                    # Mistral instruction format
                    texts = []
                    for inst, inp, out in zip(examples['instruction'], examples['input'], examples['output']):
                        text = f"<s>[INST] {inst}\n{inp} [/INST] {out}</s>"
                        texts.append(text)
                else:
                    # Standard prompt-completion format
                    texts = []
                    for prompt, completion in zip(examples.get('prompt', ['']), examples.get('completion', [''])):
                        text = prompt + completion + self.tokenizer.eos_token
                        texts.append(text)
                
                return self.tokenizer(
                    texts,
                    truncation=True,
                    padding=True,
                    max_length=512,
                    return_tensors=None
                )
            
            tokenized_dataset = dataset.map(
                tokenize_function,
                batched=True,
                remove_columns=dataset.column_names,
                desc="Tokenizing"
            )
            
            logger.info(f"✅ Dataset tokenized: {len(tokenized_dataset)} examples")
            return tokenized_dataset
            
        except Exception as e:
            logger.error(f"❌ Failed to prepare dataset: {e}")
            return None
    
    def train(self, data_file, output_dir=None, max_steps=500):
        """Train the model"""
        if not self.load_model():
            return None
            
        # Load dataset
        train_dataset = self.prepare_dataset(data_file)
        if train_dataset is None:
            return None
        
        # Setup output directory
        if output_dir is None:
            timestamp = int(time.time())
            output_dir = f"fine_tuned_{self.model_key}_sarcastic_{timestamp}"
        
        logger.info(f"🎯 Starting training...")
        logger.info(f"📁 Output directory: {output_dir}")
        logger.info(f"🔢 Max steps: {max_steps}")
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Training arguments optimized for sarcasm
        training_args = TrainingArguments(
            output_dir=output_dir,
            per_device_train_batch_size=1,
            gradient_accumulation_steps=8,
            warmup_steps=50,
            max_steps=max_steps,
            learning_rate=5e-5,
            fp16=torch.cuda.is_available(),
            logging_steps=25,
            save_steps=max_steps // 4,
            save_total_limit=2,
            dataloader_drop_last=True,
            remove_unused_columns=False,
            report_to=None,  # Disable wandb/tensorboard
        )
        
        # Create trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            data_collator=data_collator,
            train_dataset=train_dataset,
        )
        
        # Start training
        logger.info("🚀 Training started!")
        start_time = time.time()
        
        try:
            trainer.train()
            training_time = time.time() - start_time
            
            logger.info(f"✅ Training completed in {training_time:.1f}s")
            
            # Save model
            trainer.save_model(output_dir)
            self.tokenizer.save_pretrained(output_dir)
            
            # Save training info
            training_info = {
                "model_key": self.model_key,
                "model_name": self.model_name,
                "max_steps": max_steps,
                "training_time": training_time,
                "dataset_size": len(train_dataset),
                "device": str(self.device)
            }
            
            with open(os.path.join(output_dir, "training_info.json"), 'w') as f:
                json.dump(training_info, f, indent=2)
            
            logger.info(f"💾 Model saved to: {output_dir}")
            return output_dir
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return None
    
    def test_model(self, model_dir, test_messages=None):
        """Test the trained model"""
        if test_messages is None:
            test_messages = [
                "How are you doing today?",
                "I'm feeling sad",
                "Can you help me?",
                "Tell me something funny",
                "I hate my job"
            ]
        
        try:
            logger.info(f"🧪 Testing model from {model_dir}")
            
            # Load trained model
            tokenizer = AutoTokenizer.from_pretrained(model_dir)
            model = AutoModelForCausalLM.from_pretrained(
                model_dir,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            
            if not torch.cuda.is_available():
                model = model.to(self.device)
            
            print("\n" + "="*60)
            print("🎭 TESTING FINE-TUNED SARCASTIC CHATBOT")
            print("="*60)
            
            for i, message in enumerate(test_messages, 1):
                # Format prompt
                if "mistral" in self.model_key:
                    prompt = f"<s>[INST] You are a sarcastic chatbot. Respond with wit and humor.\n{message} [/INST]"
                else:
                    prompt = f"User: {message}\nSarcastic Chatbot:"
                
                # Tokenize
                inputs = tokenizer.encode(prompt, return_tensors="pt").to(model.device)
                
                # Generate
                with torch.no_grad():
                    outputs = model.generate(
                        inputs,
                        max_length=inputs.size(1) + 100,
                        num_return_sequences=1,
                        temperature=0.8,
                        do_sample=True,
                        pad_token_id=tokenizer.eos_token_id,
                        eos_token_id=tokenizer.eos_token_id,
                        repetition_penalty=1.1
                    )
                
                # Decode
                response = tokenizer.decode(outputs[0], skip_special_tokens=True)
                
                # Extract response
                if "mistral" in self.model_key and "[/INST]" in response:
                    response = response.split("[/INST]")[-1].strip()
                elif "Sarcastic Chatbot:" in response:
                    response = response.split("Sarcastic Chatbot:")[-1].strip()
                
                # Clean up
                response = response.replace(message, "").strip()[:200]
                
                print(f"\n{i}. User: {message}")
                print(f"   Bot: {response}")
            
            print("\n" + "="*60)
            return True
            
        except Exception as e:
            logger.error(f"❌ Testing failed: {e}")
            return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Train Sarcastic Chatbot - PyTorch Only")
    parser.add_argument("--model", default="mistral-7b", choices=list(SimpleSarcasticTrainer.MODELS.keys()))
    parser.add_argument("--data", default="processed_youtube_humor_dataset_mistral.jsonl")
    parser.add_argument("--steps", type=int, default=500)
    parser.add_argument("--output", help="Output directory")
    parser.add_argument("--test-only", help="Test existing model")
    
    args = parser.parse_args()
    
    trainer = SimpleSarcasticTrainer(args.model)
    
    if args.test_only:
        trainer.test_model(args.test_only)
        return
    
    # Check if data file exists
    if not os.path.exists(args.data):
        logger.error(f"❌ Data file not found: {args.data}")
        logger.info("🔄 Creating processed data...")
        
        # Try to process YouTube data
        from process_youtube_data import YouTubeHumorProcessor
        
        model_type = "mistral" if "mistral" in args.model else "falcon"
        processor = YouTubeHumorProcessor(model_type)
        
        youtube_file = "youtube_humor_dataset.jsonl"
        if os.path.exists(youtube_file):
            args.data = processor.process_youtube_dataset(youtube_file)
            logger.info(f"✅ Created training data: {args.data}")
        else:
            logger.error(f"❌ YouTube data file not found: {youtube_file}")
            return
    
    # Train model
    model_dir = trainer.train(args.data, args.output, args.steps)
    
    if model_dir:
        # Test the trained model
        trainer.test_model(model_dir)
        
        print(f"\n🎉 SUCCESS! Your sarcastic chatbot has been trained!")
        print(f"📁 Model saved to: {model_dir}")
        print(f"🚀 You can now use this model with your backend service!")
    else:
        print(f"\n❌ Training failed. Check the logs above.")

if __name__ == "__main__":
    main()