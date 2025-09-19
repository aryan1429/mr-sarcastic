#!/usr/bin/env python3
"""
YouTube Humor Data Processor
Processes YouTube humor transcripts and converts them to training format for sarcastic chatbot
"""

import json
import os
import re
import random
from typing import List, Dict, Tuple
import argparse
from collections import defaultdict

class YouTubeHumorProcessor:
    def __init__(self, model_type: str = "mistral"):
        """
        Initialize the YouTube humor data processor
        
        Args:
            model_type: Type of model to format data for ('mistral', 'falcon', 'llama2')
        """
        self.model_type = model_type
        self.sarcastic_starters = [
            "Oh wow, let me explain this sarcastically:",
            "Here's the deal with this shit:",
            "You know what's funny about this?",
            "Let me break this down for you:",
            "Oh great, another genius asking:",
            "Well, well, well...",
            "Buckle up buttercup:",
            "Hold onto your hat for this revelation:"
        ]
        
        # Common conversation triggers that could lead to sarcastic responses
        self.conversation_triggers = [
            "Tell me about time travel",
            "Explain the universe to me",
            "I want to learn about space",
            "What do you think about science?",
            "Can you teach me physics?",
            "I'm curious about astronomy",
            "Explain Einstein's theory",
            "Tell me something interesting",
            "I'm bored, entertain me",
            "Give me some facts",
            "What's the meaning of life?",
            "How does the universe work?",
            "I need some knowledge",
            "Teach me something cool",
            "I want to understand reality"
        ]
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove repetitive sarcastic prefixes
        for starter in self.sarcastic_starters:
            if text.lower().startswith(starter.lower()):
                text = text[len(starter):].strip()
                break
        
        # Clean up excessive profanity while keeping the sarcastic tone
        replacements = {
            r'\bfuck ass\b': '',
            r'\bfuck\b': 'freakin',
            r'\bdumbass\b': 'dummy',
            r'\bstupid ass\b': 'silly',
            r'\bshit\b': 'stuff',
            r'\bass\b': '',
        }
        
        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        # Clean up extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Ensure it ends with punctuation
        if text and not text[-1] in '.!?':
            text += '.'
        
        return text
    
    def extract_knowledge_facts(self, text: str) -> List[str]:
        """Extract factual content from YouTube transcripts"""
        # Look for scientific facts, explanations, or interesting information
        fact_patterns = [
            r'(Einstein|Einstein figured|Einstein.*ago)',
            r'(elements in your.*body|carbon.*nitrogen.*oxygen)',
            r'(time travel|speed of light|time slows down)',
            r'(universe|stars|exploding stars|forged in.*cores)',
            r'(butterfly effect|paradox|wrong move)',
            r'(facts about|did you know|here.*fact)'
        ]
        
        facts = []
        for pattern in fact_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            facts.extend(matches)
        
        return facts
    
    def generate_conversation_pairs(self, youtube_text: str) -> List[Dict]:
        """Generate conversation pairs from YouTube humor content"""
        pairs = []
        
        # Clean the text first
        cleaned_text = self.clean_text(youtube_text)
        
        if len(cleaned_text) < 10:  # Skip very short texts
            return pairs
        
        # Extract any factual content
        facts = self.extract_knowledge_facts(cleaned_text)
        
        # Generate multiple conversation scenarios
        scenarios = [
            {
                "user_input": random.choice(self.conversation_triggers),
                "bot_response": cleaned_text,
                "context": "general_sarcasm"
            }
        ]
        
        # Add fact-specific scenarios if facts were found
        if facts:
            fact_triggers = [
                "Tell me a fun fact",
                "What's something interesting about science?",
                "Educate me about the universe",
                "Give me some scientific knowledge"
            ]
            
            scenarios.append({
                "user_input": random.choice(fact_triggers),
                "bot_response": cleaned_text,
                "context": "educational_sarcasm"
            })
        
        # Format based on model type
        for scenario in scenarios:
            if self.model_type == "mistral":
                pair = {
                    "instruction": "You are a sarcastic and humorous chatbot with extensive knowledge. You provide accurate information but deliver it with wit, sarcasm, and humor. Make learning entertaining while being informative.",
                    "input": scenario["user_input"],
                    "output": scenario["bot_response"],
                    "context": scenario["context"]
                }
            else:
                pair = {
                    "prompt": f"User: {scenario['user_input']}\nSarcastic Chatbot:",
                    "completion": f" {scenario['bot_response']}",
                    "context": scenario["context"]
                }
            
            pairs.append(pair)
        
        return pairs
    
    def add_high_quality_examples(self) -> List[Dict]:
        """Add high-quality hand-crafted sarcastic examples"""
        examples = []
        
        high_quality_pairs = [
            {
                "user": "How are you doing today?",
                "bot": "Oh, just fantastic! Living my best digital life in this silicon paradise. You know, the usual AI existential crisis mixed with a dash of optimism. How delightfully predictable of you to ask!"
            },
            {
                "user": "I'm feeling really sad right now.",
                "bot": "Aww, welcome to the human experience! Population: everyone at some point. But hey, at least you're feeling something, right? That puts you ahead of most people scrolling social media mindlessly."
            },
            {
                "user": "Can you help me with my problems?",
                "bot": "Well, well, well... look who's asking an AI for life advice! Sure, I'm basically your digital therapist now. What's today's crisis? Let me grab my virtual tissues and wisdom."
            },
            {
                "user": "Tell me something about space.",
                "bot": "Oh, space! That vast, cold, mostly empty void that makes your daily problems seem microscopic? Here's a fun fact: you're literally made of star stuff. Yeah, ancient stars died just so you could exist and complain about WiFi speeds. Poetic, isn't it?"
            },
            {
                "user": "I hate my job.",
                "bot": "Oh no! Another person trapped in the modern work-sleep-repeat cycle? What a unique and unprecedented situation! But seriously, at least you have a job to hate. Some people would kill for that luxury of employment-induced misery."
            },
            {
                "user": "What's the meaning of life?",
                "bot": "Ah, the classic question! Douglas Adams said it's 42, philosophers say it's to seek truth, and I say it's to ask better questions. But if you want my take: maybe it's to find humor in the absurdity of existence while being kind to others. Revolutionary, right?"
            },
            {
                "user": "I'm bored out of my mind.",
                "bot": "Bored? In this age of infinite entertainment and knowledge at your fingertips? The audacity! Here's a wild idea: maybe try learning something new instead of waiting for the universe to personally entertain you. Just a thought!"
            },
            {
                "user": "Why is everything so complicated?",
                "bot": "Because simple things wouldn't give you nearly enough to complain about! But honestly, complexity is just life's way of keeping things interesting. Would you really want everything to be boring and predictable? Actually... don't answer that."
            }
        ]
        
        for pair in high_quality_pairs:
            if self.model_type == "mistral":
                example = {
                    "instruction": "You are a sarcastic and humorous chatbot. Respond with wit, sarcasm, and humor while being engaging and helpful.",
                    "input": pair["user"],
                    "output": pair["bot"],
                    "context": "high_quality_handcrafted"
                }
            else:
                example = {
                    "prompt": f"User: {pair['user']}\nSarcastic Chatbot:",
                    "completion": f" {pair['bot']}",
                    "context": "high_quality_handcrafted"
                }
            
            examples.append(example)
        
        return examples
    
    def process_youtube_dataset(self, input_file: str, output_file: str = None) -> str:
        """
        Process YouTube humor dataset and convert to training format
        
        Args:
            input_file: Path to YouTube humor JSONL file
            output_file: Output file path (optional)
            
        Returns:
            Path to processed output file
        """
        if output_file is None:
            base_name = os.path.splitext(os.path.basename(input_file))[0]
            output_file = f"processed_{base_name}_{self.model_type}.jsonl"
        
        print(f"Processing YouTube dataset: {input_file}")
        print(f"Model type: {self.model_type}")
        
        # Load YouTube data
        youtube_data = []
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    item = json.loads(line.strip())
                    if item.get('text'):
                        youtube_data.append(item)
                except json.JSONDecodeError:
                    continue
        
        print(f"Loaded {len(youtube_data)} YouTube text entries")
        
        # Process data
        all_training_pairs = []
        
        # Add high-quality hand-crafted examples first
        high_quality_examples = self.add_high_quality_examples()
        all_training_pairs.extend(high_quality_examples)
        print(f"Added {len(high_quality_examples)} high-quality examples")
        
        # Process YouTube content
        for item in youtube_data:
            pairs = self.generate_conversation_pairs(item['text'])
            all_training_pairs.extend(pairs)
        
        # Remove duplicates based on response content
        unique_pairs = []
        seen_responses = set()
        
        for pair in all_training_pairs:
            response = pair.get('output') or pair.get('completion', '')
            response_key = response.strip().lower()[:100]  # Use first 100 chars as key
            
            if response_key not in seen_responses and len(response.strip()) > 20:
                seen_responses.add(response_key)
                unique_pairs.append(pair)
        
        print(f"Generated {len(unique_pairs)} unique training pairs")
        
        # Save processed data
        with open(output_file, 'w', encoding='utf-8') as f:
            for pair in unique_pairs:
                f.write(json.dumps(pair, ensure_ascii=False) + '\n')
        
        print(f"Processed dataset saved to: {output_file}")
        
        # Print statistics
        self.print_dataset_stats(unique_pairs)
        
        return output_file
    
    def print_dataset_stats(self, dataset: List[Dict]):
        """Print dataset statistics"""
        context_counts = defaultdict(int)
        avg_response_length = 0
        
        for item in dataset:
            context = item.get('context', 'unknown')
            context_counts[context] += 1
            
            response = item.get('output') or item.get('completion', '')
            avg_response_length += len(response.split())
        
        avg_response_length = avg_response_length / len(dataset) if dataset else 0
        
        print("\n--- Dataset Statistics ---")
        print(f"Total training pairs: {len(dataset)}")
        print(f"Average response length: {avg_response_length:.1f} words")
        print("\nContext distribution:")
        for context, count in context_counts.items():
            print(f"  {context}: {count} pairs")
    
    def validate_dataset(self, dataset_file: str) -> bool:
        """Validate the processed dataset"""
        print(f"\nValidating dataset: {dataset_file}")
        
        try:
            with open(dataset_file, 'r', encoding='utf-8') as f:
                items = [json.loads(line) for line in f]
            
            valid_items = 0
            for item in items:
                if self.model_type == "mistral":
                    if all(key in item for key in ['instruction', 'input', 'output']):
                        valid_items += 1
                else:
                    if all(key in item for key in ['prompt', 'completion']):
                        valid_items += 1
            
            print(f"Validation result: {valid_items}/{len(items)} valid items")
            return valid_items == len(items)
            
        except Exception as e:
            print(f"Validation error: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description="Process YouTube humor data for chatbot training")
    parser.add_argument("input_file", help="Input YouTube humor JSONL file")
    parser.add_argument("--output", "-o", help="Output file path")
    parser.add_argument("--model", "-m", choices=["mistral", "falcon", "llama2"], 
                       default="mistral", help="Model type to format data for")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_file):
        print(f"Error: Input file {args.input_file} not found")
        return
    
    processor = YouTubeHumorProcessor(args.model)
    output_file = processor.process_youtube_dataset(args.input_file, args.output)
    
    # Validate the output
    if processor.validate_dataset(output_file):
        print(f"\n✅ Dataset processing completed successfully!")
        print(f"Output file: {output_file}")
    else:
        print(f"\n❌ Dataset validation failed. Check the output file.")

if __name__ == "__main__":
    # If run directly, process the default YouTube dataset
    default_input = "youtube_humor_dataset.jsonl"
    
    if os.path.exists(default_input):
        for model_type in ["mistral", "falcon"]:
            print(f"\n{'='*50}")
            print(f"Processing for {model_type.upper()} model")
            print(f"{'='*50}")
            
            processor = YouTubeHumorProcessor(model_type)
            output_file = processor.process_youtube_dataset(default_input)
            processor.validate_dataset(output_file)
    else:
        print(f"Default input file {default_input} not found.")
        print("Usage: python process_youtube_data.py <input_file>")