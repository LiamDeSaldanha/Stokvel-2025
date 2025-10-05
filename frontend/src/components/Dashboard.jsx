import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { stokvelAPI } from '../services/api'
import { Users, DollarSign, TrendingUp, Plus } from 'lucide-react'

export function Dashboard() {
  const [stokvels, setStokvels] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedStokvel, setSelectedStokvel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get unique stokvels from payments
  const uniqueStokvels = [...new Set(payments.map(p => p.stokvel_name))]
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [stokvelsResponse, paymentsResponse] = await Promise.all([
        stokvelAPI.getAllStokvels(),
        stokvelAPI.getAllPayments()
      ])
      setStokvels(stokvelsResponse.data)
      setPayments(paymentsResponse.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter payments based on selected stokvel
  const filteredPayments = selectedStokvel
    ? payments.filter(p => p.stokvel_name === selectedStokvel)
    : payments

  const handleStokvelChange = (event) => {
    setSelectedStokvel(event.target.value)
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
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <select
            value={selectedStokvel}
            onChange={handleStokvelChange}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stokvels</option>
            {uniqueStokvels.map((stokvel) => (
              <option key={stokvel} value={stokvel}>
                {stokvel}
              </option>
            ))}
          </select>
        </div>
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stokvels</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedStokvel ? 1 : new Set(payments.map(p => p.stokvel_name)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredPayments.map(p => p.userid)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-10 w-10 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-gray-900">
                R {filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Stokvels */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Stokvels</h2>
        </div>
        
        {stokvels.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stokvels</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new stokvel.</p>
            <div className="mt-6">
              <Link
                to="/stokvels/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Stokvel
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {stokvels.slice(0, 5).map((stokvel) => (
              <Link
                key={stokvel.id}
                to={`/stokvels/${stokvel.id}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stokvel.name}</p>
                    <p className="text-sm text-gray-500">{stokvel.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    R {stokvel.contribution_amount} {stokvel.contribution_frequency}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}