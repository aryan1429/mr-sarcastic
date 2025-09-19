#!/usr/bin/env python3
"""
Test script to verify ML environment setup
"""
import sys
import os

def test_imports():
    """Test if all required packages can be imported"""
    packages = [
        'transformers',
        'datasets',
        'torch',
        'fastapi',
        'uvicorn',
        'pydantic'
    ]

    print("Testing ML environment imports...")
    print("=" * 40)

    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} - OK")
        except ImportError as e:
            print(f"❌ {package} - FAILED: {e}")
            return False

    print("=" * 40)
    print("🎉 All packages imported successfully!")
    return True

def test_torch_cuda():
    """Test PyTorch CUDA availability"""
    import torch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU count: {torch.cuda.device_count()}")
        print(f"Current GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("⚠️  CUDA not available - training will be slower on CPU")

def main():
    print("Mr. Sarcastic ML Environment Test")
    print("=" * 40)

    # Check Python version
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print()

    # Test imports
    if not test_imports():
        print("❌ Some packages failed to import. Please check your installation.")
        sys.exit(1)

    print()

    # Test PyTorch
    test_torch_cuda()

    print()
    print("✅ ML environment is ready!")
    print("You can now run:")
    print("  python fine_tune_falcon.py    # For training")
    print("  python ml_service.py          # For API service")

if __name__ == "__main__":
    main()
