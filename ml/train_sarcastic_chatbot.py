#!/usr/bin/env python3
"""
Complete Fine-tuning Pipeline for Sarcastic Chatbot
Uses pre-trained models (Mistral, Falcon, etc.) and YouTube humor data
"""

import os
import sys
import argparse
import json
import time
import logging
from typing import Optional, Dict, Any
import torch
from transformers import TrainingArguments

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_model_service import EnhancedSarcasticModel
from process_youtube_data import YouTubeHumorProcessor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SarcasticChatbotTrainer:
    """Complete training pipeline for sarcastic chatbot"""
    
    def __init__(self, model_key: str = "mistral-7b", device: str = "auto"):
        """
        Initialize the trainer
        
        Args:
            model_key: Model to use from EnhancedSarcasticModel.SUPPORTED_MODELS
            device: Device to train on ('cuda', 'cpu', 'auto')
        """
        self.model_key = model_key
        self.device = device
        self.model_service = None
        self.training_config = self._get_default_training_config()
        
        logger.info(f"Initialized trainer with model: {model_key}")
    
    def _get_default_training_config(self) -> Dict[str, Any]:
        """Get default training configuration optimized for humor/sarcasm"""
        return {
            # Training data
            "youtube_data_file": "youtube_humor_dataset.jsonl",
            "processed_data_file": None,  # Will be auto-generated
            
            # Model training parameters
            "max_steps": 1000,
            "per_device_train_batch_size": 1,
            "gradient_accumulation_steps": 16,
            "learning_rate": 5e-5,
            "warmup_steps": 100,
            "weight_decay": 0.01,
            
            # Optimization
            "fp16": torch.cuda.is_available(),
            "dataloader_drop_last": True,
            "gradient_checkpointing": True,
            
            # Logging and saving
            "logging_steps": 50,
            "save_steps": 250,
            "save_total_limit": 3,
            "evaluation_strategy": "no",
            
            # Output
            "output_dir": f"fine_tuned_sarcastic_chatbot_{int(time.time())}",
            
            # Generation parameters
            "max_response_length": 150,
            "temperature": 0.8,
            "top_k": 50,
            "top_p": 0.9,
            "repetition_penalty": 1.1
        }
    
    def setup_model(self) -> bool:
        """Initialize the model service"""
        try:
            logger.info(f"Setting up {self.model_key} model...")
            
            self.model_service = EnhancedSarcasticModel(
                model_key=self.model_key,
                device=self.device if self.device != "auto" else None
            )
            
            # Check if model is supported
            if self.model_key not in EnhancedSarcasticModel.SUPPORTED_MODELS:
                logger.error(f"Model {self.model_key} not supported")
                return False
            
            logger.info("Model service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup model: {e}")
            return False
    
    def prepare_data(self) -> bool:
        """Prepare training data from YouTube transcripts"""
        try:
            youtube_file = self.training_config["youtube_data_file"]
            
            if not os.path.exists(youtube_file):
                logger.error(f"YouTube data file not found: {youtube_file}")
                return False
            
            logger.info(f"Preparing training data from {youtube_file}")
            
            # Extract model type for data processor
            model_type = "mistral" if "mistral" in self.model_key else "falcon"
            
            # Process YouTube data
            processor = YouTubeHumorProcessor(model_type)
            processed_file = processor.process_youtube_dataset(
                youtube_file,
                f"processed_training_data_{self.model_key}_{int(time.time())}.jsonl"
            )
            
            # Validate processed data
            if not processor.validate_dataset(processed_file):
                logger.error("Data validation failed")
                return False
            
            self.training_config["processed_data_file"] = processed_file
            logger.info(f"Training data prepared: {processed_file}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to prepare data: {e}")
            return False
    
    def train_model(self) -> Optional[str]:
        """Fine-tune the model on prepared data"""
        try:
            if not self.model_service:
                logger.error("Model service not initialized")
                return None
            
            processed_data_file = self.training_config["processed_data_file"]
            if not processed_data_file or not os.path.exists(processed_data_file):
                logger.error("Processed data file not found")
                return None
            
            output_dir = self.training_config["output_dir"]
            logger.info(f"Starting fine-tuning process...")
            logger.info(f"Output directory: {output_dir}")
            
            # Create training arguments
            training_args = {
                "max_steps": self.training_config["max_steps"],
                "per_device_train_batch_size": self.training_config["per_device_train_batch_size"],
                "gradient_accumulation_steps": self.training_config["gradient_accumulation_steps"],
                "learning_rate": self.training_config["learning_rate"],
                "warmup_steps": self.training_config["warmup_steps"],
                "weight_decay": self.training_config["weight_decay"],
                "fp16": self.training_config["fp16"],
                "dataloader_drop_last": self.training_config["dataloader_drop_last"],
                "gradient_checkpointing": self.training_config["gradient_checkpointing"],
                "logging_steps": self.training_config["logging_steps"],
                "save_steps": self.training_config["save_steps"],
                "save_total_limit": self.training_config["save_total_limit"],
                "evaluation_strategy": self.training_config["evaluation_strategy"],
            }
            
            # Start training
            start_time = time.time()
            final_model_dir = self.model_service.fine_tune(
                training_data_path=processed_data_file,
                output_dir=output_dir,
                **training_args
            )
            
            training_duration = time.time() - start_time
            logger.info(f"Training completed in {training_duration:.2f}s")
            
            # Save training configuration
            config_file = os.path.join(final_model_dir, "training_config.json")
            with open(config_file, 'w') as f:
                json.dump(self.training_config, f, indent=2)
            
            logger.info(f"Fine-tuned model saved to: {final_model_dir}")
            return final_model_dir
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return None
    
    def test_model(self, model_dir: str, test_messages: Optional[list] = None) -> bool:
        """Test the fine-tuned model with sample messages"""
        try:
            if test_messages is None:
                test_messages = [
                    "How are you doing today?",
                    "I'm feeling really sad and down",
                    "Can you help me with my problems?",
                    "Tell me something interesting about space",
                    "I hate my job and feel stuck",
                    "What's the meaning of life?",
                    "I'm so bored right now",
                    "Why is everything so complicated?",
                    "Can you make me laugh?",
                    "I need some motivation"
                ]
            
            logger.info("Testing fine-tuned model...")
            
            print("\n" + "="*60)
            print("TESTING FINE-TUNED SARCASTIC CHATBOT")
            print("="*60)
            
            for i, message in enumerate(test_messages, 1):
                try:
                    response = self.model_service.generate_sarcastic_response(
                        user_message=message,
                        model_path=model_dir,
                        max_length=self.training_config["max_response_length"],
                        temperature=self.training_config["temperature"]
                    )
                    
                    print(f"\n{i}. User: {message}")
                    print(f"   Bot: {response}")
                    
                except Exception as e:
                    logger.error(f"Failed to generate response for message {i}: {e}")
                    print(f"\n{i}. User: {message}")
                    print(f"   Bot: [Error generating response]")
            
            print("\n" + "="*60)
            return True
            
        except Exception as e:
            logger.error(f"Testing failed: {e}")
            return False
    
    def run_complete_pipeline(self, custom_config: Optional[Dict] = None) -> Optional[str]:
        """
        Run the complete training pipeline
        
        Args:
            custom_config: Optional custom configuration to override defaults
            
        Returns:
            Path to trained model directory or None if failed
        """
        logger.info("Starting complete training pipeline...")
        
        # Update configuration if provided
        if custom_config:
            self.training_config.update(custom_config)
            logger.info("Updated training configuration with custom values")
        
        # Step 1: Setup model
        if not self.setup_model():
            logger.error("Pipeline failed at model setup")
            return None
        
        # Step 2: Prepare data
        if not self.prepare_data():
            logger.error("Pipeline failed at data preparation")
            return None
        
        # Step 3: Train model
        model_dir = self.train_model()
        if not model_dir:
            logger.error("Pipeline failed at training")
            return None
        
        # Step 4: Test model
        if not self.test_model(model_dir):
            logger.warning("Model testing had issues, but training completed")
        
        logger.info(f"✅ Complete pipeline finished successfully!")
        logger.info(f"📁 Model saved to: {model_dir}")
        
        return model_dir
    
    def update_config(self, **kwargs):
        """Update training configuration"""
        self.training_config.update(kwargs)
        logger.info("Training configuration updated")

def main():
    parser = argparse.ArgumentParser(description="Fine-tune sarcastic chatbot with pre-trained models")
    parser.add_argument("--model", "-m", default="mistral-7b", 
                       choices=list(EnhancedSarcasticModel.SUPPORTED_MODELS.keys()),
                       help="Pre-trained model to use")
    parser.add_argument("--device", "-d", default="auto", choices=["auto", "cuda", "cpu"],
                       help="Device to use for training")
    parser.add_argument("--youtube-data", default="youtube_humor_dataset.jsonl",
                       help="Path to YouTube humor dataset")
    parser.add_argument("--max-steps", type=int, default=1000,
                       help="Maximum training steps")
    parser.add_argument("--output-dir", help="Output directory for trained model")
    parser.add_argument("--batch-size", type=int, default=1,
                       help="Per-device training batch size")
    parser.add_argument("--learning-rate", type=float, default=5e-5,
                       help="Learning rate")
    parser.add_argument("--test-only", help="Test an existing model without training")
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = SarcasticChatbotTrainer(
        model_key=args.model,
        device=args.device
    )
    
    # If testing only
    if args.test_only:
        if os.path.exists(args.test_only):
            trainer.setup_model()
            trainer.test_model(args.test_only)
        else:
            print(f"Model directory not found: {args.test_only}")
        return
    
    # Update configuration with command line arguments
    config_updates = {
        "youtube_data_file": args.youtube_data,
        "max_steps": args.max_steps,
        "per_device_train_batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
    }
    
    if args.output_dir:
        config_updates["output_dir"] = args.output_dir
    
    # Run the complete pipeline
    try:
        model_dir = trainer.run_complete_pipeline(config_updates)
        
        if model_dir:
            print(f"\n🎉 SUCCESS! Your sarcastic chatbot has been trained!")
            print(f"📁 Model location: {model_dir}")
            print(f"🚀 You can now integrate this model with your backend service")
        else:
            print(f"\n❌ Training failed. Check the logs for details.")
            
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
        print("\n⏹️ Training interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    main()