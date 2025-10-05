from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
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
    users = relationship("User", back_populates="stokvel")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, )
    id_number = Column(String)
    stokvel_id = Column(Integer, ForeignKey("stokvels.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    stokvel = relationship("Stokvel", back_populates="users")

class Payments(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    userid = Column(Integer, nullable=False)
    stokvel_id = Column(Integer, nullable=False)
    stokvel_name = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    payment_status = Column(Integer, default=0, nullable=False)
    
    @property
    def compute_payment_status(self):
        # Get the first and last day of the current month with UTC timezone
        if not self.payment_date:
            return 0
            
        today = datetime.now(self.payment_date.tzinfo)  
        start_of_month = datetime(today.year, today.month, 1, tzinfo=self.payment_date.tzinfo)
        if today.month == 12:
            end_of_month = datetime(today.year + 1, 1, 1, tzinfo=self.payment_date.tzinfo)
        else:
            end_of_month = datetime(today.year, today.month + 1, 1, tzinfo=self.payment_date.tzinfo)
        
        # Check if payment date is within the current month
        if start_of_month <= self.payment_date < end_of_month:
            return 1
        return 0
    
    # Relationships

class StokvelEnrollment(Base):
    __tablename__ = "stokvel_enrollment"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    stokvel_id = Column(Integer, ForeignKey("stokvels.id"), nullable=False)
    isAdmin = Column(Boolean, default=False, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[userId])
    stokvel = relationship("Stokvel", foreign_keys=[stokvel_id])

# Pydantic Models for API
class StokvelBase(BaseModel):
    name: str
    description: Optional[str] = None
    contribution_amount: float
    contribution_frequency: str
    payout_frequency: str

class StokvelCreate(StokvelBase):
    pass

class StokvelResponse(StokvelBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
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
    userid: int
    stokvel_id: int
    stokvel_name: str
    amount: float
    payment_status: Optional[int] = 0

class PaymentsCreate(PaymentsBase):
    pass

class PaymentsResponse(PaymentsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    payment_date: datetime