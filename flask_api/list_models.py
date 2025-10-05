"""List available Gemini models"""
import google.generativeai as genai
import os

# Get your own free API key at: https://ai.google.dev/
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables")
    print("Get your free key at: https://ai.google.dev/")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("Available Gemini Models:")
print("=" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"\nModel: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Supported Methods: {model.supported_generation_methods}")
