#!/usr/bin/env python3
"""
Debug test for the enhanced ML backend
"""

import subprocess
import time
import sys

def debug_ml_backend():
    print("Starting ML backend with debug output...")
    
    # Start the ML backend in a subprocess and capture output
    process = subprocess.Popen([
        sys.executable, 
        "backend/services/simple_ml_backend.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    # Give it time to start and capture initial output
    time.sleep(2)
    
    # Check if process is still running
    if process.poll() is None:
        print("✅ Process is running")
        
        # Try to get some output
        try:
            stdout, stderr = process.communicate(timeout=1)
            print("Process output:")
            print(stdout)
            if stderr:
                print("Process errors:")
                print(stderr)
        except subprocess.TimeoutExpired:
            print("Process is running but no output captured yet")
            process.kill()
            stdout, stderr = process.communicate()
            print("Final output:")
            print(stdout)
    else:
        # Process exited
        stdout, stderr = process.communicate()
        print(f"❌ Process exited with code: {process.returncode}")
        print("Output:")
        print(stdout)
        if stderr:
            print("Errors:")
            print(stderr)

if __name__ == "__main__":
    debug_ml_backend()