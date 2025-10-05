"""
Pydantic AI Agent for Stokvel Information Chatbot

This module implements a Pydantic AI agent that connects to the PostgreSQL database
to provide information about stokvels, users, payments, and enrollments.
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel

from config import get_db, OPENAI_API_KEY
from models import Stokvel, User, Payments, StokvelEnrollment


class StokvelChatbotDependencies(BaseModel):
    """Dependencies for the Stokvel chatbot agent"""
    model_config = {"arbitrary_types_allowed": True}
    
    db: Session


# Define the agent with system prompt
stokvel_agent = Agent(
    'openai:gpt-4o-mini',  # You can change this to your preferred model
    deps_type=StokvelChatbotDependencies,
    system_prompt="""
    You are a helpful AI assistant specializing in Stokvel information. You have access to a PostgreSQL database 
    containing information about stokvels, users, payments, and enrollments.

    Your role is to help users understand:
    - What stokvels are and how they work
    - Information about specific stokvels in the database
    - User enrollment and participation data
    - Payment histories and financial information
    - General stokvel advice and best practices

    You can query the database to provide accurate, real-time information. Always be helpful, accurate, and educational.
    When providing financial information, remind users that this is for informational purposes only.

    Available database tables:
    - stokvels: Contains stokvel details (name, goal, contributions, net_value, etc.)
    - users: Contains user information (name, surname, email, etc.)
    - payments: Contains payment records (amount, date, etc.)
    - stokvel_enrollment: Contains enrollment information (user-stokvel relationships, admin status)
    """,
)


@stokvel_agent.tool
async def get_all_stokvels(ctx: RunContext[StokvelChatbotDependencies]) -> List[Dict[str, Any]]:
    """Get information about all stokvels in the database"""
    db = ctx.deps.db
    stokvels = db.query(Stokvel).all()
    
    result = []
    for stokvel in stokvels:
        result.append({
            "id": stokvel.id,
            "name": stokvel.name,
            "number_people": stokvel.number_people,
            "goal": stokvel.goal,
            "monthly_contribution": stokvel.monthly_contribution,
            "net_value": stokvel.net_value,
            "interest_rate": stokvel.interest_rate,
            "started_at": stokvel.started_at.isoformat() if stokvel.started_at else None,
            "end_at": stokvel.end_at.isoformat() if stokvel.end_at else None
        })
    
    return result


@stokvel_agent.tool
async def get_stokvel_by_id(ctx: RunContext[StokvelChatbotDependencies], stokvel_id: int) -> Optional[Dict[str, Any]]:
    """Get detailed information about a specific stokvel by ID"""
    db = ctx.deps.db
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    
    if not stokvel:
        return None
    
    # Get enrollment count
    enrollment_count = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvel_id == stokvel_id).count()
    
    # Get total payments
    total_payments = db.query(Payments).filter(Payments.stokvel_id == stokvel_id).count()
    
    return {
        "id": stokvel.id,
        "name": stokvel.name,
        "number_people": stokvel.number_people,
        "goal": stokvel.goal,
        "monthly_contribution": stokvel.monthly_contribution,
        "net_value": stokvel.net_value,
        "interest_rate": stokvel.interest_rate,
        "started_at": stokvel.started_at.isoformat() if stokvel.started_at else None,
        "end_at": stokvel.end_at.isoformat() if stokvel.end_at else None,
        "current_enrollments": enrollment_count,
        "total_payments_made": total_payments
    }


@stokvel_agent.tool
async def get_stokvel_members(ctx: RunContext[StokvelChatbotDependencies], stokvel_id: int) -> List[Dict[str, Any]]:
    """Get all members enrolled in a specific stokvel"""
    db = ctx.deps.db
    
    enrollments = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvel_id == stokvel_id).all()
    
    result = []
    for enrollment in enrollments:
        user = db.query(User).filter(User.id == enrollment.userid).first()
        if user:
            result.append({
                "user_id": user.id,
                "name": f"{user.name} {user.surname}",
                "email": user.email,
                "is_admin": enrollment.isAdmin,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None
            })
    
    return result


@stokvel_agent.tool
async def get_user_stokvels(ctx: RunContext[StokvelChatbotDependencies], user_id: int) -> List[Dict[str, Any]]:
    """Get all stokvels a user is enrolled in"""
    db = ctx.deps.db
    
    enrollments = db.query(StokvelEnrollment).filter(StokvelEnrollment.userid == user_id).all()
    
    result = []
    for enrollment in enrollments:
        stokvel = db.query(Stokvel).filter(Stokvel.id == enrollment.stokvel_id).first()
        if stokvel:
            result.append({
                "stokvel_id": stokvel.id,
                "stokvel_name": stokvel.name,
                "monthly_contribution": stokvel.monthly_contribution,
                "net_value": stokvel.net_value,
                "is_admin": enrollment.isAdmin,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None
            })
    
    return result


@stokvel_agent.tool
async def get_payment_history(ctx: RunContext[StokvelChatbotDependencies], user_id: Optional[int] = None, stokvel_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get payment history for a user or stokvel"""
    db = ctx.deps.db
    
    query = db.query(Payments)
    
    if user_id:
        query = query.filter(Payments.userid == user_id)
    
    if stokvel_id:
        query = query.filter(Payments.stokvel_id == stokvel_id)
    
    payments = query.order_by(Payments.date.desc()).limit(50).all()
    
    result = []
    for payment in payments:
        user = db.query(User).filter(User.id == payment.userid).first()
        stokvel = db.query(Stokvel).filter(Stokvel.id == payment.stokvel_id).first()
        
        result.append({
            "payment_id": payment.id,
            "amount": payment.amount,
            "date": payment.date.isoformat() if payment.date else None,
            "user_name": f"{user.name} {user.surname}" if user else "Unknown User",
            "stokvel_name": stokvel.name if stokvel else "Unknown Stokvel"
        })
    
    return result


@stokvel_agent.tool
async def get_stokvel_statistics(ctx: RunContext[StokvelChatbotDependencies], stokvel_id: int) -> Optional[Dict[str, Any]]:
    """Get comprehensive statistics for a stokvel"""
    db = ctx.deps.db
    
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    if not stokvel:
        return None
    
    # Count members
    member_count = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvel_id == stokvel_id).count()
    
    # Count admins
    admin_count = db.query(StokvelEnrollment).filter(
        StokvelEnrollment.stokvel_id == stokvel_id,
        StokvelEnrollment.isAdmin == True
    ).count()
    
    # Get payment statistics
    payments = db.query(Payments).filter(Payments.stokvel_id == stokvel_id).all()
    total_collected = sum(p.amount for p in payments) if payments else 0
    payment_count = len(payments)
    
    # Calculate average payment
    avg_payment = total_collected / payment_count if payment_count > 0 else 0
    
    return {
        "stokvel_name": stokvel.name,
        "member_count": member_count,
        "admin_count": admin_count,
        "total_payments_count": payment_count,
        "total_amount_collected": total_collected,
        "average_payment_amount": avg_payment,
        "target_monthly_contribution": stokvel.monthly_contribution,
        "current_net_value": stokvel.net_value,
        "interest_rate": stokvel.interest_rate,
        "goal": stokvel.goal
    }


@stokvel_agent.tool
async def calculate_emergency_withdrawal(ctx: RunContext[StokvelChatbotDependencies], user_id: int, stokvel_id: int) -> Dict[str, Any]:
    """Calculate what a user would receive in an emergency withdrawal (simulation only)"""
    db = ctx.deps.db
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Check enrollment
    enrollment = db.query(StokvelEnrollment).filter(
        StokvelEnrollment.userid == user_id,
        StokvelEnrollment.stokvel_id == stokvel_id
    ).first()
    
    if not enrollment:
        return {"error": "User is not enrolled in this stokvel"}
    
    # Calculate total contributions
    from sqlalchemy import func
    total_contributions = db.query(func.sum(Payments.amount)).filter(
        Payments.userid == user_id,
        Payments.stokvel_id == stokvel_id
    ).scalar() or 0
    
    if total_contributions <= 0:
        return {"error": "No contributions found"}
    
    # Calculate penalty and withdrawal amount
    penalty_rate = 0.10  # 10% penalty
    penalty_amount = total_contributions * penalty_rate
    withdrawal_amount = total_contributions - penalty_amount
    
    return {
        "user_id": user_id,
        "stokvel_id": stokvel_id,
        "total_contributions": total_contributions,
        "penalty_rate": "10%",
        "penalty_amount": penalty_amount,
        "withdrawal_amount": withdrawal_amount,
        "note": "This is a simulation. Actual withdrawal requires using the emergency withdrawal endpoint."
    }

@stokvel_agent.tool
async def search_stokvels_by_name(ctx: RunContext[StokvelChatbotDependencies], search_term: str) -> List[Dict[str, Any]]:
    """Search for stokvels by name"""
    db = ctx.deps.db
    
    stokvels = db.query(Stokvel).filter(
        Stokvel.name.ilike(f"%{search_term}%")
    ).all()
    
    result = []
    for stokvel in stokvels:
        member_count = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvel_id == stokvel.id).count()
        
        result.append({
            "id": stokvel.id,
            "name": stokvel.name,
            "goal": stokvel.goal,
            "monthly_contribution": stokvel.monthly_contribution,
            "net_value": stokvel.net_value,
            "member_count": member_count
        })
    
    return result


async def chat_with_stokvel_agent(message: str, db: Session) -> str:
    """
    Main function to chat with the Stokvel AI agent
    
    Args:
        message: User's message/question
        db: Database session
        
    Returns:
        AI agent's response
    """
    # Check if OpenAI API key is available
    if not OPENAI_API_KEY:
        return "I'm sorry, but the AI chat service is not properly configured. Please set the OPENAI_API_KEY environment variable to use this feature."
    
    try:
        deps = StokvelChatbotDependencies(db=db)
        result = await stokvel_agent.run(message, deps=deps)
        return result.data
    except Exception as e:
        return f"I'm sorry, I encountered an error while processing your request: {str(e)}"


# Example usage function for testing
async def example_conversation(db: Session):
    """Example conversation with the agent"""
    
    questions = [
        "What stokvels are available?",
        "Tell me about stokvel with ID 1",
        "What is a stokvel and how does it work?",
        "Show me payment history for stokvel 1",
        "What are the statistics for stokvel 1?"
    ]
    
    for question in questions:
        print(f"\nUser: {question}")
        response = await chat_with_stokvel_agent(question, db)
        print(f"AI: {response}")