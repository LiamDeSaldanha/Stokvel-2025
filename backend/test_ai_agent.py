"""
Test script for the Pydantic AI Agent

This script tests the AI agent functionality without requiring the full web application.
"""

import asyncio
import os
from sqlalchemy.orm import sessionmaker
from config import engine
from ai_agent import chat_with_stokvel_agent


async def test_chat_agent():
    """Test the chat agent with some sample questions"""
    
    # Create database session
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Test questions
        test_questions = [
            "Hello! What can you help me with?",
            "What is a stokvel?",
            "What stokvels are available in the database?",
            "Tell me about stokvel statistics",
            "How do stokvels work?"
        ]
        
        print("🤖 Testing Stokvel AI Agent\n")
        print("=" * 50)
        
        for i, question in enumerate(test_questions, 1):
            print(f"\n{i}. User: {question}")
            print("-" * 30)
            
            try:
                response = await chat_with_stokvel_agent(question, db)
                print(f"AI: {response}")
            except Exception as e:
                print(f"Error: {e}")
            
            print("-" * 30)
        
        print("\n✅ Chat agent test completed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        db.close()


if __name__ == "__main__":
    # Set OpenAI API key if provided as environment variable
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  Warning: OPENAI_API_KEY not found in environment variables.")
        print("   The agent will work but won't be able to make AI calls.")
        print("   To test with AI, set: export OPENAI_API_KEY='your_key_here'")
        print()
    
    # Run the test
    asyncio.run(test_chat_agent())