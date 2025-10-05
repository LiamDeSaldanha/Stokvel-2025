import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { stokvelAPI } from '../services/api'
import { Users, Plus, Calendar, DollarSign } from 'lucide-react'

export function StokvelList() {
  const [stokvels, setStokvels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchStokvels()
  }, [])
  
  const fetchStokvels = async () => {
    try {
      const response = await stokvelAPI.getAllStokvels()
      setStokvels(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch stokvels')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Stokvels</h1>
        <Link
          to="/stokvels/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Stokvel</span>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {stokvels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No stokvels found</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first stokvel.</p>
          <div className="mt-6">
            <Link
              to="/stokvels/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Your First Stokvel
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stokvels.map((stokvel) => (
            <Link
              key={stokvel.id}
              to={`/stokvels/${stokvel.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-xs text-gray-500">
                  {new Date(stokvel.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{stokvel.name}</h3>
              
              {stokvel.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {stokvel.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>R {stokvel.contribution_amount} per {stokvel.contribution_frequency}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Payout: {stokvel.payout_frequency}</span>
                </div>
              </div>
              
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View Details →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}