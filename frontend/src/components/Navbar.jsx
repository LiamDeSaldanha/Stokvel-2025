import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Home, Plus, Bot, LogIn, UserPlus, Upload, CreditCard } from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <Users className="brand-icon" />
            <span className="brand-text">Stokvel Manager</span>
          </Link>
          
          <div className="nav-menu">
            <Link
              to="/"
              className={isActive('/')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={isActive('/dashboard')}
            >
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/stokvels"
              className={isActive('/stokvels')}
            >
              <Users className="h-4 w-4" />
              <span>Stokvels</span>
            </Link>
            
            <Link
              to="/stokvels/create"
              className={isActive('/stokvels/create')}
            >
              <Plus className="h-4 w-4" />
              <span>Create Stokvel</span>
            </Link>
            
            <Link
              to="/payment"
              className={isActive('/payment')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Make Payment</span>
            </Link>
            
            <Link
              to="/upload"
              className={isActive('/upload')}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            
            <Link
              to="/chat"
              className={isActive('/chat')}
            >
              <Bot className="h-4 w-4" />
              <span>AI Chat</span>
            </Link>
            
            <Link
              to="/login"
              className={isActive('/login')}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            
            <Link
              to="/register"
              className={isActive('/register')}
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}