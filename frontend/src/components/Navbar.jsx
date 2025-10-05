import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Home, Plus } from 'lucide-react'

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
          </div>
        </div>
      </div>
    </nav>
  )
}