from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from models import (
    Stokvel, Member, Contribution, Payout,
    StokvelCreate, StokvelResponse,
    MemberCreate, MemberResponse,
    ContributionCreate, ContributionResponse
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
    db_stokvel = Stokvel(**stokvel.dict())
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

# Member endpoints
@app.post("/stokvels/{stokvel_id}/members/", response_model=MemberResponse)
async def add_member(stokvel_id: int, member: MemberCreate, db: Session = Depends(get_db)):
    """Add a member to a stokvel"""
    # Check if stokvel exists
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    db_member = Member(**member.dict(), stokvel_id=stokvel_id)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@app.get("/stokvels/{stokvel_id}/members/", response_model=List[MemberResponse])
async def get_members(stokvel_id: int, db: Session = Depends(get_db)):
    """Get all members of a stokvel"""
    members = db.query(Member).filter(Member.stokvel_id == stokvel_id).all()
    return members

# Contribution endpoints
@app.post("/contributions/", response_model=ContributionResponse)
async def make_contribution(contribution: ContributionCreate, db: Session = Depends(get_db)):
    """Record a member's contribution"""
    # Verify member exists
    member = db.query(Member).filter(Member.id == contribution.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db_contribution = Contribution(**contribution.dict())
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return db_contribution

@app.get("/stokvels/{stokvel_id}/contributions/", response_model=List[ContributionResponse])
async def get_contributions(stokvel_id: int, db: Session = Depends(get_db)):
    """Get all contributions for a stokvel"""
    contributions = db.query(Contribution).join(Member).filter(
        Member.stokvel_id == stokvel_id
    ).all()
    return contributions

@app.get("/members/{member_id}/contributions/", response_model=List[ContributionResponse])
async def get_member_contributions(member_id: int, db: Session = Depends(get_db)):
    """Get all contributions by a specific member"""
    contributions = db.query(Contribution).filter(
        Contribution.member_id == member_id
    ).all()
    return contributions

# Dashboard endpoint
@app.get("/dashboard/{stokvel_id}")
async def get_dashboard_data(stokvel_id: int, db: Session = Depends(get_db)):
    """Get dashboard data for a stokvel"""
    stokvel = db.query(Stokvel).filter(Stokvel.id == stokvel_id).first()
    if not stokvel:
        raise HTTPException(status_code=404, detail="Stokvel not found")
    
    members_count = db.query(Member).filter(Member.stokvel_id == stokvel_id).count()
    total_contributions = db.query(Contribution).join(Member).filter(
        Member.stokvel_id == stokvel_id
    ).count()
    
    total_amount = db.query(db.func.sum(Contribution.amount)).join(Member).filter(
        Member.stokvel_id == stokvel_id
    ).scalar() or 0
    
    return {
        "stokvel": stokvel,
        "members_count": members_count,
        "total_contributions": total_contributions,
        "total_amount": float(total_amount)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)