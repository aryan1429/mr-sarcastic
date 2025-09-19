from transformers import AutoModelForCausalLM, AutoTokenizer, DataCollatorForLanguageModeling, Trainer, TrainingArguments
from datasets import load_dataset, Dataset
import torch
import json
import os
import logging
from typing import Optional, List, Dict
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedSarcasticModel:
    """
    Enhanced model service supporting multiple pre-trained models optimized for sarcasm and humor
    """
    
    # Supported models with their configurations
    SUPPORTED_MODELS = {
        "mistral-7b": {
            "name": "mistralai/Mistral-7B-Instruct-v0.1",
            "description": "Best for sarcasm and instruction following",
            "max_length": 4096,
            "recommended": True
        },
        "falcon-7b": {
            "name": "tiiuae/falcon-7b-instruct",
            "description": "Good general conversation model",
            "max_length": 2048,
            "recommended": False
        },
        "llama2-7b": {
            "name": "meta-llama/Llama-2-7b-chat-hf",
            "description": "Excellent conversational abilities",
            "max_length": 4096,
            "recommended": True
        },
        "codellama-7b": {
            "name": "codellama/CodeLlama-7b-Instruct-hf",
            "description": "Great for witty and technical humor",
            "max_length": 16384,
            "recommended": False
        }
    }
    
    def __init__(self, model_key: str = "mistral-7b", device: Optional[str] = None):
        """
        Initialize the enhanced sarcastic model
        
        Args:
            model_key: Key from SUPPORTED_MODELS
            device: Device to load model on ('cuda', 'cpu', or 'auto')
        """
        if model_key not in self.SUPPORTED_MODELS:
            raise ValueError(f"Model {model_key} not supported. Choose from: {list(self.SUPPORTED_MODELS.keys())}")
        
        self.model_key = model_key
        self.model_config = self.SUPPORTED_MODELS[model_key]
        self.model_name = self.model_config["name"]
        
        # Device setup
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)
            
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
        
        logger.info(f"Initialized {model_key} model service on device: {self.device}")
        
    def load_model(self, force_reload: bool = False):
        """Load the pretrained model and tokenizer"""
        if self.is_loaded and not force_reload:
            logger.info("Model already loaded")
            return
            
        logger.info(f"Loading model {self.model_name} on device: {self.device}")
        start_time = time.time()
        
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Add padding token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            # Load model with appropriate settings
            model_kwargs = {
                "trust_remote_code": True,
                "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
                "low_cpu_mem_usage": True
            }
            
            # Use device_map for multi-GPU setups
            if torch.cuda.is_available() and torch.cuda.device_count() > 1:
                model_kwargs["device_map"] = "auto"
            else:
                model_kwargs["device_map"] = None
                
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                **model_kwargs
            )
            
            # Move to device if not using device_map
            if model_kwargs["device_map"] is None:
                self.model = self.model.to(self.device)
            
            self.is_loaded = True
            load_time = time.time() - start_time
            
            logger.info(f"Model loaded successfully in {load_time:.2f}s")
            logger.info(f"Model parameters: {self.model.num_parameters():,}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def prepare_training_data(self, youtube_data_path: str, output_path: str = None) -> str:
        """
        Convert YouTube humor data to proper training format for fine-tuning
        
        Args:
            youtube_data_path: Path to YouTube humor JSONL file
            output_path: Optional custom output path
            
        Returns:
            Path to the prepared training data
        """
        if output_path is None:
            output_path = f"prepared_training_data_{self.model_key}.jsonl"
            
        logger.info(f"Preparing training data from {youtube_data_path}")
        
        # Load YouTube data
        with open(youtube_data_path, 'r', encoding='utf-8') as f:
            youtube_data = [json.loads(line) for line in f]
        
        prepared_data = []
        
        # Convert to proper instruction format for different models
        for item in youtube_data:
            text = item.get('text', '')
            if not text.strip():
                continue
                
            # Create instruction-based format optimized for sarcasm
            if self.model_key == "mistral-7b":
                # Mistral format with system instruction
                formatted_item = {
                    "instruction": "You are a sarcastic and humorous chatbot. Respond with wit, sarcasm, and humor while being engaging.",
                    "input": self._extract_user_input(text),
                    "output": self._extract_sarcastic_response(text)
                }
            else:
                # Standard format for other models
                formatted_item = {
                    "prompt": f"User: {self._extract_user_input(text)}\nSarcastic Chatbot:",
                    "completion": f" {self._extract_sarcastic_response(text)}"
                }
            
            if formatted_item.get("output") or formatted_item.get("completion"):
                prepared_data.append(formatted_item)
        
        # Add additional sarcastic examples
        prepared_data.extend(self._get_sarcastic_examples())
        
        # Save prepared data
        with open(output_path, 'w', encoding='utf-8') as f:
            for item in prepared_data:
                f.write(json.dumps(item, ensure_ascii=False) + '\n')
        
        logger.info(f"Prepared {len(prepared_data)} training examples saved to {output_path}")
        return output_path
    
    def _extract_user_input(self, text: str) -> str:
        """Extract potential user input from YouTube humor text"""
        # Simple heuristic - look for common conversation starters
        common_inputs = [
            "How are you?", "What's up?", "Tell me something",
            "I'm bored", "I'm sad", "I'm happy", "Help me",
            "What should I do?", "I need advice", "Tell me a joke"
        ]
        
        # For now, generate random user inputs that would lead to sarcastic responses
        import random
        return random.choice(common_inputs)
    
    def _extract_sarcastic_response(self, text: str) -> str:
        """Extract and clean sarcastic response from YouTube text"""
        # Clean up the text - remove excessive profanity while keeping the sarcastic tone
        text = text.strip()
        
        # Remove repetitive sarcastic prefixes that are in the data
        prefixes_to_remove = [
            "Oh wow, let me explain this sarcastically:",
            "Here's the deal with this shit:",
            "You know what's funny about this?",
            "Let me break this down for you:"
        ]
        
        for prefix in prefixes_to_remove:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        
        # Clean up excessive profanity but keep the sarcastic tone
        text = text.replace("fuck ass", "").replace("dumbass", "dummy").replace("stupid ass", "silly")
        
        return text[:200]  # Limit response length
    
    def _get_sarcastic_examples(self) -> List[Dict]:
        """Get additional high-quality sarcastic training examples"""
        examples = [
            {
                "instruction" if self.model_key == "mistral-7b" else "prompt": 
                    "You are a sarcastic chatbot" if self.model_key == "mistral-7b" else "User: How are you?\nSarcastic Chatbot:",
                "input" if self.model_key == "mistral-7b" else "completion":
                    "How are you?" if self.model_key == "mistral-7b" else " Oh, just peachy! Living my best digital life in this silicon paradise. How delightful.",
                "output" if self.model_key == "mistral-7b" else None:
                    "Oh, just peachy! Living my best digital life in this silicon paradise. How delightful." if self.model_key == "mistral-7b" else None
            },
            {
                "instruction" if self.model_key == "mistral-7b" else "prompt": 
                    "You are a sarcastic chatbot" if self.model_key == "mistral-7b" else "User: I'm feeling down.\nSarcastic Chatbot:",
                "input" if self.model_key == "mistral-7b" else "completion":
                    "I'm feeling down." if self.model_key == "mistral-7b" else " Aww, join the club! We meet every day at 3 AM when existential dread kicks in. But hey, at least you're consistent!",
                "output" if self.model_key == "mistral-7b" else None:
                    "Aww, join the club! We meet every day at 3 AM when existential dread kicks in. But hey, at least you're consistent!" if self.model_key == "mistral-7b" else None
            },
            {
                "instruction" if self.model_key == "mistral-7b" else "prompt": 
                    "You are a sarcastic chatbot" if self.model_key == "mistral-7b" else "User: Can you help me?\nSarcastic Chatbot:",
                "input" if self.model_key == "mistral-7b" else "completion":
                    "Can you help me?" if self.model_key == "mistral-7b" else " Well, well, well... Look who needs help from an AI. Sure, I'm basically your digital therapist now. What's the crisis du jour?",
                "output" if self.model_key == "mistral-7b" else None:
                    "Well, well, well... Look who needs help from an AI. Sure, I'm basically your digital therapist now. What's the crisis du jour?" if self.model_key == "mistral-7b" else None
            }
        ]
        
        # Filter out None values for non-Mistral models
        if self.model_key != "mistral-7b":
            examples = [{k: v for k, v in ex.items() if v is not None} for ex in examples]
        
        return examples
    
    def fine_tune(self, training_data_path: str, output_dir: str = None, **training_args):
        """
        Fine-tune the model on sarcastic conversation data
        
        Args:
            training_data_path: Path to prepared training data
            output_dir: Directory to save the fine-tuned model
            **training_args: Additional training arguments
        """
        if not self.is_loaded:
            self.load_model()
        
        if output_dir is None:
            output_dir = f"./fine_tuned_{self.model_key}_sarcastic"
        
        logger.info(f"Starting fine-tuning with data from {training_data_path}")
        
        # Load and prepare dataset
        train_dataset = self._load_training_dataset(training_data_path)
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Default training arguments optimized for sarcasm
        default_args = {
            "output_dir": output_dir,
            "per_device_train_batch_size": 1,
            "gradient_accumulation_steps": 16,
            "warmup_steps": 100,
            "max_steps": 1000,
            "learning_rate": 5e-5,
            "fp16": torch.cuda.is_available(),
            "logging_steps": 50,
            "save_steps": 250,
            "save_total_limit": 3,
            "dataloader_drop_last": True,
            "evaluation_strategy": "no",
            "load_best_model_at_end": False,
        }
        
        # Override with user-provided arguments
        default_args.update(training_args)
        
        training_arguments = TrainingArguments(**default_args)
        
        # Create trainer
        trainer = Trainer(
            model=self.model,
            args=training_arguments,
            data_collator=data_collator,
            train_dataset=train_dataset,
        )
        
        # Start training
        logger.info("Starting fine-tuning...")
        start_time = time.time()
        
        trainer.train()
        
        training_time = time.time() - start_time
        logger.info(f"Training completed in {training_time:.2f}s")
        
        # Save model and tokenizer
        trainer.save_model(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        
        logger.info(f"Fine-tuned model saved to {output_dir}")
        return output_dir
    
    def _load_training_dataset(self, data_path: str) -> Dataset:
        """Load and tokenize training dataset"""
        with open(data_path, 'r', encoding='utf-8') as f:
            data = [json.loads(line) for line in f]
        
        dataset = Dataset.from_list(data)
        
        def tokenize_function(examples):
            if self.model_key == "mistral-7b":
                # Format for Mistral with instruction format
                texts = []
                for inst, inp, out in zip(examples['instruction'], examples['input'], examples['output']):
                    text = f"<s>[INST] {inst}\n{inp} [/INST] {out}</s>"
                    texts.append(text)
            else:
                # Standard format for other models
                texts = []
                for prompt, completion in zip(examples['prompt'], examples['completion']):
                    text = prompt + completion + self.tokenizer.eos_token
                    texts.append(text)
            
            return self.tokenizer(
                texts,
                truncation=True,
                padding=True,
                max_length=min(512, self.model_config["max_length"] // 4),
                return_tensors=None
            )
        
        tokenized_dataset = dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=dataset.column_names
        )
        
        return tokenized_dataset
    
    def generate_sarcastic_response(self, user_message: str, model_path: str = None, 
                                  max_length: int = 150, temperature: float = 0.8) -> str:
        """
        Generate a sarcastic response to user input
        
        Args:
            user_message: User's input message
            model_path: Path to fine-tuned model (optional)
            max_length: Maximum response length
            temperature: Sampling temperature (higher = more creative)
            
        Returns:
            Generated sarcastic response
        """
        if model_path:
            # Load fine-tuned model
            self._load_fine_tuned_model(model_path)
        elif not self.is_loaded:
            self.load_model()
        
        # Format prompt based on model type
        if self.model_key == "mistral-7b":
            formatted_prompt = f"<s>[INST] You are a sarcastic and humorous chatbot. Respond with wit and sarcasm.\n{user_message} [/INST]"
        else:
            formatted_prompt = f"User: {user_message}\nSarcastic Chatbot:"
        
        # Tokenize input
        inputs = self.tokenizer.encode(formatted_prompt, return_tensors="pt")
        if torch.cuda.is_available() and inputs.device != self.model.device:
            inputs = inputs.to(self.model.device)
        
        # Generate response
        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_length=len(inputs[0]) + max_length,
                num_return_sequences=1,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                repetition_penalty=1.1,
                top_k=50,
                top_p=0.9
            )
        
        # Decode and clean response
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the bot response
        if self.model_key == "mistral-7b":
            if "[/INST]" in response:
                response = response.split("[/INST]")[-1].strip()
        else:
            if "Sarcastic Chatbot:" in response:
                response = response.split("Sarcastic Chatbot:")[-1].strip()
        
        # Clean up response
        response = response.replace(user_message, "").strip()
        
        return response[:max_length]
    
    def _load_fine_tuned_model(self, model_path: str):
        """Load a fine-tuned model"""
        logger.info(f"Loading fine-tuned model from {model_path}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None
        )
        
        if not torch.cuda.is_available():
            self.model = self.model.to(self.device)
        
        self.is_loaded = True
        logger.info("Fine-tuned model loaded successfully")
    
    @classmethod
    def list_supported_models(cls) -> Dict:
        """Return information about all supported models"""
        return cls.SUPPORTED_MODELS
    
    def get_model_info(self) -> Dict:
        """Get information about the current model"""
        return {
            "model_key": self.model_key,
            "model_name": self.model_name,
            "device": str(self.device),
            "is_loaded": self.is_loaded,
            "config": self.model_config
        }

if __name__ == "__main__":
    # Example usage
    print("Available models:")
    for key, info in EnhancedSarcasticModel.list_supported_models().items():
        print(f"- {key}: {info['description']} (Recommended: {info['recommended']})")
    
    # Initialize with Mistral (recommended for sarcasm)
    model = EnhancedSarcasticModel("mistral-7b")
    
    # Prepare training data
    youtube_data_path = "youtube_humor_dataset.jsonl"
    if os.path.exists(youtube_data_path):
        prepared_data_path = model.prepare_training_data(youtube_data_path)
        print(f"Training data prepared: {prepared_data_path}")
        
        # Fine-tune (uncomment to run)
        # output_dir = model.fine_tune(prepared_data_path, max_steps=500)
        # print(f"Model fine-tuned and saved to: {output_dir}")
    
    # Test generation (with base model)
    model.load_model()
    test_messages = [
        "How are you today?",
        "I'm feeling sad",
        "Can you help me?",
        "Tell me a joke"
    ]
    
    print("\n--- Testing sarcastic responses ---")
    for msg in test_messages:
        response = model.generate_sarcastic_response(msg)
        print(f"User: {msg}")
        print(f"Bot: {response}\n")