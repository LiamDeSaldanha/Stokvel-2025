import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { stokvelAPI } from '../services/api'
import { Users, DollarSign, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
    <div className="min-h-screen bg-gray-50 p-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-green-600" />
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
            <DollarSign className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-gray-900">
                R {filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Contributions Graph */}
      {selectedStokvel && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Individual Contributions for {selectedStokvel}</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(filteredPayments.reduce((acc, payment) => {
                  acc[payment.userid] = (acc[payment.userid] || 0) + Number(payment.amount);
                  return acc;
                }, {})).map(([userid, amount]) => ({
                  userid: `Member ${userid}`,
                  amount: amount
                }))}
                margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userid" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis
                  label={{ value: 'Amount (R)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `R ${value}`}
                />
                <Tooltip
                  formatter={(value) => [`R ${value.toFixed(2)}`, 'Total Contribution']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      

    </div>
  )
}