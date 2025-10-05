import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Home, Plus, Bot, LogIn, UserPlus, Upload, CreditCard } from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Stokvel Manager</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/')}`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/dashboard')}`}
            >
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/stokvels"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/stokvels')}`}
            >
              <Users className="h-4 w-4" />
              <span>Stokvels</span>
            </Link>
            
            <Link
              to="/stokvels/create"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/stokvels/create')}`}
            >
              <Plus className="h-4 w-4" />
              <span>Create Stokvel</span>
            </Link>
            
            <Link
              to="/payment"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/payment')}`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Make Payment</span>
            </Link>
            
            <Link
              to="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/upload')}`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            
            <Link
              to="/chat"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/chat')}`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Chat</span>
            </Link>
            
            <Link
              to="/login"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/login')}`}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            
            <Link
              to="/register"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/register')}`}
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