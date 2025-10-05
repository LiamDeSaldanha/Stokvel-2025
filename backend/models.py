from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
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
    description = Column(Text)
    contribution_amount = Column(Float, nullable=False)
    contribution_frequency = Column(String, nullable=False)  # weekly, monthly, etc.
    payout_frequency = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    members = relationship("Member", back_populates="stokvel")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    stokvel_id = Column(Integer, ForeignKey("stokvels.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    stokvel = relationship("Stokvel", back_populates="members")
    contributions = relationship("Contribution", back_populates="member")

class Contribution(Base):
    __tablename__ = "contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    amount = Column(Float, nullable=False)
    contribution_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    
    # Relationships
    member = relationship("Member", back_populates="contributions")

class Payout(Base):
    __tablename__ = "payouts"
    
    id = Column(Integer, primary_key=True, index=True)
    stokvel_id = Column(Integer, ForeignKey("stokvels.id"))
    member_id = Column(Integer, ForeignKey("members.id"))
    amount = Column(Float, nullable=False)
    payout_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)

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

class MemberBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    stokvel_id: int
    joined_at: datetime

class ContributionBase(BaseModel):
    member_id: int
    amount: float
    notes: Optional[str] = None

class ContributionCreate(ContributionBase):
    pass

class ContributionResponse(ContributionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    contribution_date: datetime