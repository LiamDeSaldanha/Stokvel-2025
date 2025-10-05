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
    
    # Create enrollment
    db_enrollment = StokvelEnrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

# Payment endpoints
@app.post("/payments/", response_model=PaymentsResponse)
async def create_payment(payment: PaymentsCreate, db: Session = Depends(get_db)):
    """Create a new payment and compute its status"""
    # Check if user exists
    user = db.query(User).filter(User.id == payment.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if stokvel exists
    stokvel = db.query(Stokvel).filter(Stokvel.id == payment.stokvelId).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    # Create payment
    db_payment = Payments(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    # Update payment status based on computation
    db_payment.payment_status = db_payment.compute_payment_status
    db.commit()
    
    return db_payment

@app.get("/payments/", response_model=List[PaymentsResponse])
async def get_payments(
    skip: int = 0, 
    limit: int = 100, 
    user_id: int = None, 
    stokvel_id: int = None, 
    db: Session = Depends(get_db)
):
    """Get all payments with optional filtering by user or stokvel"""
    query = db.query(Payments)
    
    if user_id:
        query = query.filter(Payments.userid == user_id)
    if stokvel_id:
        query = query.filter(Payments.stokvelId == stokvel_id)
    
    payments = query.offset(skip).limit(limit).all()
    
    # Update payment status for all returned payments
    for payment in payments:
        payment.payment_status = payment.compute_payment_status
    db.commit()
    
    return payments

@app.get("/payments/{payment_id}", response_model=PaymentsResponse)
async def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get a specific payment"""
    payment = db.query(Payments).filter(Payments.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment status
    payment.payment_status = payment.compute_payment_status
    db.commit()
    
    return payment

@app.get("/payments/user/{user_id}/status")
async def get_user_payment_status(user_id: int, stokvel_id: int, db: Session = Depends(get_db)):
    """Check if a user has made their payment for the current month"""
    # Get the most recent payment for the user in the specified stokvel
    payment = db.query(Payments)\
        .filter(Payments.userid == user_id)\
        .filter(Payments.stokvelId == stokvel_id)\
        .order_by(Payments.date.desc())\
        .first()
    
    if not payment:
        return {"status": 0, "message": "No payments found"}
    
    status = payment.compute_payment_status
    return {
        "status": status,
        "message": "Payment is up to date" if status == 1 else "Payment is due",
        "last_payment_date": payment.date
    }
    
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)