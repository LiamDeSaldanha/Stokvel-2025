import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stokvelAPI } from '../services/api'
import { ArrowLeft, Save } from 'lucide-react'

export function CreateStokvel() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    payout_frequency: 'monthly'
  })
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const submitData = {
        ...formData,
        contribution_amount: parseFloat(formData.contribution_amount)
      }
      
      const response = await stokvelAPI.createStokvel(submitData)
      navigate(`/stokvels/${response.data.id}`)
    } catch (err) {
      setError('Failed to create stokvel. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Stokvel</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Stokvel Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter stokvel name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the purpose of this stokvel"
            />
          </div>
          
          <div>
            <label htmlFor="contribution_amount" className="block text-sm font-medium text-gray-700">
              Contribution Amount (R) *
            </label>
            <input
              type="number"
              name="contribution_amount"
              id="contribution_amount"
              required
              min="0"
              step="0.01"
              value={formData.contribution_amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contribution_frequency" className="block text-sm font-medium text-gray-700">
                Contribution Frequency *
              </label>
              <select
                name="contribution_frequency"
                id="contribution_frequency"
                required
                value={formData.contribution_frequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="payout_frequency" className="block text-sm font-medium text-gray-700">
                Payout Frequency *
              </label>
              <select
                name="payout_frequency"
                id="payout_frequency"
                required
                value={formData.payout_frequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Stokvel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}