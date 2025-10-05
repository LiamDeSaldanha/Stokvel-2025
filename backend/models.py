from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

Base = declarative_base()

# SQLAlchemy Models
class Stokvel(Base):
    __tablename__ = "stokvels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    number_people = Column(Integer)
    goal = Column(Text)
    monthly_contribution = Column(Integer)
    net_value = Column(Integer, nullable=False)
    interest_rate = Column(Integer, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    end_at = Column(DateTime(timezone=True))
    
    # Relationships
    enrollments = relationship("StokvelEnrollment", back_populates="stokvel")
    payments = relationship("Payments", back_populates="stokvel")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String )
    id_number = Column(String)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    verified = Column(Boolean)
    
    # Relationships
    enrollments = relationship("StokvelEnrollment", back_populates="user")
    payments = relationship("Payments", back_populates="user")
    
    def emergency_withdraw(self, stokvel_id: int, db_session) -> dict:
        """
        Emergency withdrawal method for a user from a specific stokvel.
        Calculates the user's total contributions and allows withdrawal with potential penalties.
        """
        from sqlalchemy import func
        
        # Check if user is enrolled in the stokvel
        enrollment = db_session.query(StokvelEnrollment).filter(
            StokvelEnrollment.userId == self.id,
            StokvelEnrollment.stokvelId == stokvel_id
        ).first()
        
        if not enrollment:
            return {
                "success": False,
                "message": "User is not enrolled in this stokvel",
                "withdrawal_amount": 0
            }
        
        # Get the stokvel details
        stokvel = db_session.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
        if not stokvel:
            return {
                "success": False,
                "message": "Stokvel not found",
                "withdrawal_amount": 0
            }
        
        # Calculate total contributions by this user to this stokvel
        total_contributions = db_session.query(func.sum(Payments.amount)).filter(
            Payments.userId == self.id,
            Payments.stokvelId == stokvel_id
        ).scalar() or 0
        
        if total_contributions <= 0:
            return {
                "success": False,
                "message": "No contributions found for withdrawal",
                "withdrawal_amount": 0
            }
        
        # Calculate penalty (e.g., 10% penalty for emergency withdrawal)
        penalty_rate = 0.10  # 10% penalty
        penalty_amount = total_contributions * penalty_rate
        withdrawal_amount = total_contributions - penalty_amount
        
        # Check if stokvel has enough net value for withdrawal
        if stokvel.net_value < withdrawal_amount:
            return {
                "success": False,
                "message": "Insufficient funds in stokvel for withdrawal",
                "withdrawal_amount": 0,
                "available_amount": stokvel.net_value
            }
        
        # Update stokvel net value
        stokvel.net_value -= int(withdrawal_amount)
        
        # Remove user from stokvel enrollment
        db_session.delete(enrollment)
        
        # Record the withdrawal as a negative payment
        withdrawal_record = Payments(
            userId=self.id,
            stokvelId=stokvel_id,
            amount=-withdrawal_amount
        )
        db_session.add(withdrawal_record)
        
        try:
            db_session.commit()
            return {
                "success": True,
                "message": "Emergency withdrawal successful",
                "total_contributions": total_contributions,
                "penalty_amount": penalty_amount,
                "withdrawal_amount": withdrawal_amount,
                "remaining_stokvel_value": stokvel.net_value
            }
        except Exception as e:
            db_session.rollback()
            return {
                "success": False,
                "message": f"Database error during withdrawal: {str(e)}",
                "withdrawal_amount": 0
            }

class Payments(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    stokvelId = Column(Integer, ForeignKey("stokvels.id"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    stokvel = relationship("Stokvel", back_populates="payments")

class StokvelEnrollment(Base):
    __tablename__ = "stokvel_enrollment"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    stokvelId = Column(Integer, ForeignKey("stokvels.id"), nullable=False)
    isAdmin = Column(Boolean, default=False, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    stokvel = relationship("Stokvel", back_populates="enrollments")




# Pydantic Models for API
class StokvelBase(BaseModel):
    name: str
    number_people: Optional[int] = None
    goal: Optional[str] = None
    monthly_contribution: Optional[int] = None
    net_value: int
    interest_rate: int
    end_at: Optional[datetime] = None

class StokvelCreate(StokvelBase):
    pass

class StokvelResponse(StokvelBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    started_at: Optional[datetime] = None

class UserBase(BaseModel):
    name: str
    surname: str
    password: str
    email: Optional[str] = None
    id_number: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    surname: str
    email: Optional[str] = None
    id_number: Optional[str] = None
    joined_at: datetime

class StokvelEnrollmentBase(BaseModel):
    userId: int
    stokvelId: int
    isAdmin: bool = False

class StokvelEnrollmentCreate(StokvelEnrollmentBase):
    pass

class StokvelEnrollmentResponse(StokvelEnrollmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    enrolled_at: datetime

class PaymentsBase(BaseModel):
    userId: int
    stokvelId: int
    amount: float

class PaymentsCreate(PaymentsBase):
    pass

class PaymentsResponse(PaymentsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    date: datetime