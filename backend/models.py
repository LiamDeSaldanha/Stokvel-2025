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
    userid = Column(Integer, ForeignKey("users.id"), nullable=False)
    stokvelId = Column(Integer, ForeignKey("stokvels.id"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[userid])
    stokvel = relationship("Stokvel", foreign_keys=[stokvelId])

class StokvelEnrollment(Base):
    __tablename__ = "stokvel_enrollment"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    stokvelId = Column(Integer, ForeignKey("stokvels.id"), nullable=False)
    isAdmin = Column(Boolean, default=False, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[userId])
    stokvel = relationship("Stokvel", foreign_keys=[stokvelId])




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
    userId: int
    stokvelId: int
    amount: float

class PaymentsCreate(PaymentsBase):
    pass

class PaymentsResponse(PaymentsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    date: datetime