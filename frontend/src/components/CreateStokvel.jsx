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
    goal: '',
    number_people: '',
    monthly_contribution: '',
    net_value: '',
    interest_rate: '',
    end_at: ''
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
        name: formData.name,
        goal: formData.goal || null,
        number_people: formData.number_people ? parseInt(formData.number_people) : null,
        monthly_contribution: formData.monthly_contribution ? parseInt(formData.monthly_contribution) : null,
        net_value: parseInt(formData.net_value),
        interest_rate: parseInt(formData.interest_rate),
        end_at: formData.end_at || null
      }
      
      const response = await stokvelAPI.createStokvel(submitData)
      navigate(`/stokvels/${response.data.id}`)
    } catch (err) {
      setError('Failed to create stokvel. Please try again.')
      console.error('Stokvel creation error:', err)
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
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
              Goal/Description
            </label>
            <textarea
              name="goal"
              id="goal"
              rows={3}
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the purpose and goals of this stokvel"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="number_people" className="block text-sm font-medium text-gray-700">
                Number of People
              </label>
              <input
                type="number"
                name="number_people"
                id="number_people"
                min="1"
                value={formData.number_people}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Expected number of members"
              />
            </div>
            
            <div>
              <label htmlFor="monthly_contribution" className="block text-sm font-medium text-gray-700">
                Monthly Contribution (R)
              </label>
              <input
                type="number"
                name="monthly_contribution"
                id="monthly_contribution"
                min="0"
                value={formData.monthly_contribution}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Expected monthly contribution amount"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="net_value" className="block text-sm font-medium text-gray-700">
                Initial Net Value (R) *
              </label>
              <input
                type="number"
                name="net_value"
                id="net_value"
                required
                min="0"
                value={formData.net_value}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Starting value of the stokvel fund"
              />
            </div>
            
            <div>
              <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700">
                Interest Rate (%) *
              </label>
              <input
                type="number"
                name="interest_rate"
                id="interest_rate"
                required
                min="0"
                max="100"
                value={formData.interest_rate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Annual interest rate"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="end_at" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              name="end_at"
              id="end_at"
              value={formData.end_at}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Optional: Set when the stokvel should end</p>
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