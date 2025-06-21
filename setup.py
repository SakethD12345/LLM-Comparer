#!/usr/bin/env python3
"""
Setup script for LLM Comparer project.
This script installs all required dependencies and downloads necessary models.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up LLM Comparer project...")
    print("=" * 50)
    
    # Check if Python 3.8+ is available
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install pip dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Download spaCy English model
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model"):
        print("❌ Failed to download spaCy model. You can try manually:")
        print("   python -m spacy download en_core_web_sm")
    
    # Download NLTK data
    print("🔄 Downloading NLTK data...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)
        nltk.download('averaged_perceptron_tagger', quiet=True)
        print("✅ NLTK data downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download NLTK data: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the FastAPI backend: python -m uvicorn main:app --reload")
    print("2. Start the Next.js frontend: npm run dev")
    print("3. Open http://localhost:3000 in your browser")
    print("\nFor more information, check the README.md file.")

if __name__ == "__main__":
    main() 