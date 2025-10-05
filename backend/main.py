from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from models import (
    Stokvel, User, Payments, StokvelEnrollment,
    StokvelCreate, StokvelResponse,
    UserCreate, UserResponse,
    PaymentsCreate, PaymentsResponse,
    StokvelEnrollmentCreate, StokvelEnrollmentResponse
)
from config import get_db, engine
from ai_agent import chat_with_stokvel_agent
from pydantic import BaseModel
import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stokvel API",
    description="A comprehensive API for managing Stokvel groups",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Stokvel API is running"}

# Stokvel endpoints
@app.post("/stokvels/", response_model=StokvelResponse)
async def create_stokvel(stokvel: StokvelCreate, db: Session = Depends(get_db)):
    """Create a new stokvel group"""
    db_stokvel = Stokvel(**stokvel.model_dump())
    db.add(db_stokvel)
    db.commit()
    db.refresh(db_stokvel)
    return db_stokvel

@app.get("/stokvels/", response_model=List[StokvelResponse])
async def get_stokvels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all stokvel groups"""
    stokvels = db.query(Stokvel).offset(skip).limit(limit).all()
    return stokvels

@app.get("/stokvels/{stokvel_id}", response_model=StokvelResponse)
async def get_stokvel(stokvel_id: int, db: Session = Depends(get_db)):
    """Get a specific stokvel group"""
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    return stokvel

# User endpoints
@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Stokvel Enrollment endpoints
@app.post("/enrollments/", response_model=StokvelEnrollmentResponse)
async def create_enrollment(enrollment: StokvelEnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a user in a stokvel"""
    # Check if user exists
    user = db.query(User).filter(User.id == enrollment.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if stokvel exists
    stokvel = db.query(Stokvel).filter(Stokvel.id == enrollment.stokvelId).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    db_enrollment = StokvelEnrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@app.get("/stokvels/{stokvel_id}/enrollments/", response_model=List[StokvelEnrollmentResponse])
async def get_stokvel_enrollments(stokvel_id: int, db: Session = Depends(get_db)):
    """Get all enrollments for a stokvel"""
    enrollments = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvelId == stokvel_id).all()
    return enrollments

# Payments endpoints
@app.post("/payments/", response_model=PaymentsResponse)
async def create_payment(payment: PaymentsCreate, db: Session = Depends(get_db)):
    """Record a payment"""
    # Verify user exists
    user = db.query(User).filter(User.id == payment.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify stokvel exists
    stokvel = db.query(Stokvel).filter(Stokvel.id == payment.stokvelId).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    db_payment = Payments(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@app.get("/stokvels/{stokvel_id}/payments/", response_model=List[PaymentsResponse])
async def get_stokvel_payments(stokvel_id: int, db: Session = Depends(get_db)):
    """Get all payments for a stokvel"""
    payments = db.query(Payments).filter(Payments.stokvelId == stokvel_id).all()
    return payments

@app.get("/users/{user_id}/payments/", response_model=List[PaymentsResponse])
async def get_user_payments(user_id: int, db: Session = Depends(get_db)):
    """Get all payments by a specific user"""
    payments = db.query(Payments).filter(Payments.userId == user_id).all()
    return payments

# Dashboard endpoint
@app.get("/dashboard/{stokvel_id}")
async def get_dashboard_data(stokvel_id: int, db: Session = Depends(get_db)):
    """Get dashboard data for a stokvel"""
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    enrollments_count = db.query(StokvelEnrollment).filter(StokvelEnrollment.stokvelId == stokvel_id).count()
    total_payments = db.query(Payments).filter(Payments.stokvelId == stokvel_id).count()
    
    from sqlalchemy import func
    total_amount = db.query(func.sum(Payments.amount)).filter(
        Payments.stokvelId == stokvel_id
    ).scalar() or 0
    
    return {
        "stokvel": stokvel,
        "enrollments_count": enrollments_count,
        "total_payments": total_payments,
        "total_amount": float(total_amount)
    }

# Pydantic models for chatbot
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_message: ChatMessage, db: Session = Depends(get_db)):
    """Chat with the Stokvel AI agent"""
    try:
        response = await chat_with_stokvel_agent(chat_message.message, db)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/chat/health")
async def chat_health():
    """Check if the chat service is healthy"""
    return {"status": "Chat service is running", "agent": "Stokvel AI Assistant"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)