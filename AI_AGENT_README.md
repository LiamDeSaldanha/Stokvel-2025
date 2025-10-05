# Stokvel AI Agent Documentation

## Overview

The Stokvel AI Agent is a Pydantic AI-powered chatbot that provides intelligent information about stokvels, users, payments, and enrollments stored in your PostgreSQL database.

## Features

### Available Tools
The AI agent has access to the following database tools:

1. **get_all_stokvels()** - Retrieves information about all stokvels
2. **get_stokvel_by_id(stokvel_id)** - Gets detailed info about a specific stokvel
3. **get_stokvel_members(stokvel_id)** - Lists all members of a stokvel
4. **get_user_stokvels(user_id)** - Shows stokvels a user is enrolled in
5. **get_payment_history(user_id?, stokvel_id?)** - Gets payment records
6. **get_stokvel_statistics(stokvel_id)** - Provides comprehensive stokvel stats
7. **search_stokvels_by_name(search_term)** - Searches stokvels by name

### Sample Questions

The AI agent can answer questions like:

- "What stokvels are available?"
- "Tell me about stokvel with ID 1"
- "Who are the members of stokvel 2?"
- "Show me payment history for user 5"
- "What are the statistics for stokvel 1?"
- "Search for stokvels with 'savings' in the name"
- "What is a stokvel and how does it work?"
- "How much money has been collected by stokvel 3?"

## Setup

### Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the AI features
2. **PostgreSQL Database**: The agent connects to your existing stokvel database
3. **Python Dependencies**: Install the required packages

### Installation

1. Install the pydantic-ai dependency:
   ```bash
   pip install pydantic-ai
   ```

2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your_openai_api_key_here"
   ```
   
   Or create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://stokvel_user:stokvel_pass@postgres:5432/stokvel_db
   ```

### Configuration

The AI agent automatically uses:
- **Model**: `openai:gpt-4o-mini` (configurable in `ai_agent.py`)
- **Database**: Your existing PostgreSQL stokvel database
- **Dependencies**: Session-based database access through SQLAlchemy

## API Endpoints

### POST /chat
Send a message to the AI agent

**Request Body:**
```json
{
  "message": "What stokvels are available?"
}
```

**Response:**
```json
{
  "response": "I found 3 stokvels in the database: Family Savings Circle, Community Investment Group, and Monthly Contribution Club..."
}
```

### GET /chat/health
Check if the chat service is running

**Response:**
```json
{
  "status": "Chat service is running",
  "agent": "Stokvel AI Assistant"
}
```

## Frontend Integration

The chat interface is available at `/chat` in the web application and includes:

- Real-time messaging interface
- Message history
- Loading indicators
- Sample question buttons
- Error handling

## Testing

Run the test script to verify the AI agent works:

```bash
cd backend
python test_ai_agent.py
```

## Troubleshooting

### Common Issues

1. **"AI chat service is not properly configured"**
   - Solution: Set the `OPENAI_API_KEY` environment variable

2. **"I encountered an error while processing your request"**
   - Check your OpenAI API key is valid
   - Verify database connection
   - Check the backend logs for specific errors

3. **Database connection errors**
   - Ensure PostgreSQL is running
   - Verify database credentials in `config.py`
   - Check if the database tables exist

### Error Handling

The AI agent includes robust error handling:
- Graceful degradation when OpenAI API is unavailable
- Database connection error handling
- Input validation and sanitization
- Detailed error messages for debugging

## Customization

### Changing the AI Model

Edit `ai_agent.py` to use a different model:
```python
stokvel_agent = Agent(
    'openai:gpt-4',  # Change to gpt-4, claude-3-sonnet, etc.
    deps_type=StokvelChatbotDependencies,
    # ... rest of config
)
```

### Adding New Tools

Add custom database tools by creating new functions with the `@stokvel_agent.tool` decorator:

```python
@stokvel_agent.tool
async def your_custom_tool(ctx: RunContext[StokvelChatbotDependencies], param: str) -> Dict:
    """Your custom tool description"""
    db = ctx.deps.db
    # Your database queries here
    return {"result": "data"}
```

### Customizing System Prompt

Modify the `system_prompt` in the `stokvel_agent` definition to change the AI's behavior and knowledge.

## Security Considerations

- The AI agent only has read access to the database
- All database queries are parameterized to prevent SQL injection
- API keys are loaded from environment variables, not hardcoded
- User inputs are validated through Pydantic models

## Performance Notes

- Database queries are optimized with proper indexing
- Results are limited to prevent excessive data transfer
- The agent caches database sessions efficiently
- Response times depend on OpenAI API latency