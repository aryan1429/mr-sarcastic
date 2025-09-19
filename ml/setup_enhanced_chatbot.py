#!/usr/bin/env python3
"""
Setup and Training Script for Mr. Sarcastic Enhanced Chatbot
Automates the entire process from data preparation to model deployment
"""

import os
import sys
import subprocess
import argparse
import json
import time
from pathlib import Path

def run_command(command, description, check=True, shell=True):
    """Run a command with logging"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"Command: {command}")
    print('='*60)
    
    try:
        if shell and isinstance(command, str):
            result = subprocess.run(command, shell=True, check=check, 
                                  capture_output=False, text=True)
        else:
            result = subprocess.run(command, check=check, 
                                  capture_output=False, text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} - SUCCESS")
        else:
            print(f"❌ {description} - FAILED")
            
        return result.returncode == 0
        
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED with error: {e}")
        return False
    except Exception as e:
        print(f"❌ {description} - ERROR: {e}")
        return False

def check_python_environment():
    """Check if we're in the right Python environment"""
    print("\n🐍 Checking Python environment...")
    
    python_version = sys.version_info
    if python_version.major != 3 or python_version.minor < 8:
        print(f"❌ Python 3.8+ required, found {python_version.major}.{python_version.minor}")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check if we can import torch
    try:
        import torch
        print(f"✅ PyTorch {torch.__version__}")
        if torch.cuda.is_available():
            print(f"🚀 CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            print("⚠️  CUDA not available - will use CPU (slower)")
    except ImportError:
        print("❌ PyTorch not found - will install dependencies")
        return False
    
    return True

def install_dependencies():
    """Install required Python dependencies"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    return run_command(
        f"pip install -r {requirements_file}",
        "Installing ML dependencies"
    )

def check_youtube_data():
    """Check if YouTube humor data exists"""
    youtube_file = Path(__file__).parent / "youtube_humor_dataset.jsonl"
    
    if not youtube_file.exists():
        print(f"❌ YouTube humor data not found: {youtube_file}")
        print("Please run the YouTube data extraction first!")
        return False
    
    # Count lines
    with open(youtube_file, 'r', encoding='utf-8') as f:
        lines = sum(1 for _ in f)
    
    print(f"✅ YouTube humor data found: {lines} entries")
    return True

def process_training_data(model_type="mistral"):
    """Process YouTube data for training"""
    script_path = Path(__file__).parent / "process_youtube_data.py"
    youtube_file = Path(__file__).parent / "youtube_humor_dataset.jsonl"
    
    if not script_path.exists():
        print(f"❌ Data processing script not found: {script_path}")
        return False
    
    return run_command(
        f"python {script_path} {youtube_file} --model {model_type}",
        f"Processing YouTube data for {model_type} model"
    )

def train_model(model_type="mistral-7b", max_steps=1000, quick=False):
    """Train the sarcastic chatbot model"""
    script_path = Path(__file__).parent / "train_sarcastic_chatbot.py"
    
    if not script_path.exists():
        print(f"❌ Training script not found: {script_path}")
        return False
    
    # Adjust parameters for quick training
    if quick:
        max_steps = min(max_steps, 200)
        print(f"⚡ Quick training mode: reduced to {max_steps} steps")
    
    youtube_file = Path(__file__).parent / "youtube_humor_dataset.jsonl"
    
    command = (f"python {script_path} "
              f"--model {model_type} "
              f"--youtube-data {youtube_file} "
              f"--max-steps {max_steps}")
    
    return run_command(
        command,
        f"Training {model_type} model ({max_steps} steps)"
    )

def start_ml_service():
    """Start the enhanced ML backend service"""
    service_script = Path(__file__).parent.parent / "backend" / "services" / "enhanced_ml_backend.py"
    
    if not service_script.exists():
        print(f"❌ ML service script not found: {service_script}")
        return False
    
    print("\n🚀 Starting Enhanced ML Backend Service...")
    print("Service will run on http://localhost:8001")
    print("Press Ctrl+C to stop the service")
    
    try:
        subprocess.run([
            sys.executable, str(service_script),
            "--host", "0.0.0.0",
            "--port", "8001"
        ], check=True)
        return True
    except KeyboardInterrupt:
        print("\n⏹️  Service stopped by user")
        return True
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

def setup_complete_pipeline(args):
    """Run the complete setup pipeline"""
    print("\n🎭 Mr. Sarcastic Enhanced Chatbot Setup")
    print("="*60)
    
    start_time = time.time()
    
    # Step 1: Check environment
    if not check_python_environment():
        if not install_dependencies():
            print("\n❌ Setup failed at dependency installation")
            return False
    
    # Step 2: Check data
    if not check_youtube_data():
        print("\n❌ Setup failed - YouTube data missing")
        print("Please extract YouTube humor data first using youtube_extractor.py")
        return False
    
    # Step 3: Process data
    model_base = args.model.split('-')[0]  # Extract base model type
    if not process_training_data(model_base):
        print("\n❌ Setup failed at data processing")
        return False
    
    # Step 4: Train model (if requested)
    if not args.skip_training:
        if not train_model(args.model, args.max_steps, args.quick):
            print("\n❌ Setup failed at model training")
            return False
    else:
        print("\n⏭️  Skipping training as requested")
    
    # Step 5: Start service (if requested)
    if args.start_service:
        start_ml_service()
    
    total_time = time.time() - start_time
    
    print(f"\n🎉 Setup completed in {total_time:.1f} seconds!")
    print("\n📋 Next steps:")
    print("1. Start the ML service: python backend/services/enhanced_ml_backend.py")
    print("2. Start your Node.js backend: npm run dev (in backend folder)")
    print("3. Start your React frontend: npm run dev (in frontend folder)")
    print("4. Test your enhanced sarcastic chatbot!")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="Setup Mr. Sarcastic Enhanced Chatbot")
    parser.add_argument("--model", "-m", default="mistral-7b",
                       choices=["mistral-7b", "falcon-7b", "llama2-7b", "codellama-7b"],
                       help="Pre-trained model to use")
    parser.add_argument("--max-steps", type=int, default=1000,
                       help="Maximum training steps")
    parser.add_argument("--quick", action="store_true",
                       help="Quick training mode (reduced steps)")
    parser.add_argument("--skip-training", action="store_true",
                       help="Skip model training")
    parser.add_argument("--start-service", action="store_true",
                       help="Start ML service after setup")
    parser.add_argument("--install-deps", action="store_true",
                       help="Only install dependencies")
    parser.add_argument("--train-only", action="store_true",
                       help="Only run training")
    parser.add_argument("--service-only", action="store_true",
                       help="Only start the ML service")
    
    args = parser.parse_args()
    
    try:
        # Handle specific actions
        if args.install_deps:
            success = install_dependencies()
        elif args.train_only:
            model_base = args.model.split('-')[0]
            success = (process_training_data(model_base) and 
                      train_model(args.model, args.max_steps, args.quick))
        elif args.service_only:
            success = start_ml_service()
        else:
            # Run complete pipeline
            success = setup_complete_pipeline(args)
        
        if success:
            print("\n✅ All operations completed successfully!")
        else:
            print("\n❌ Some operations failed. Check the logs above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()