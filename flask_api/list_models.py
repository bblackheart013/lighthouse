"""List available Gemini models"""
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyBaSA-1bFG_4rxW3eh3O9Mteq6w6Xz4sqs"
genai.configure(api_key=GEMINI_API_KEY)

print("Available Gemini Models:")
print("=" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"\nModel: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Supported Methods: {model.supported_generation_methods}")
