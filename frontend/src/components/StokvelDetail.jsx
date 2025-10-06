import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stokvelAPI } from '../services/api'
import { ArrowLeft, Users, Plus, DollarSign, Calendar } from 'lucide-react'

export function StokvelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [stokvel, setStokvel] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  const [contributionForm, setContributionForm] = useState({
    member_id: '',
    amount: '',
    notes: ''
  })
  
  useEffect(() => {
    fetchStokvelData()
  }, [id])
  
  const fetchStokvelData = async () => {
    try {
      const [stokvelRes, enrollmentsRes, contributionsRes] = await Promise.all([
        stokvelAPI.getStokvel(id),
        stokvelAPI.getStokvelEnrollments(id),
        stokvelAPI.getStokvelPayments(id)
      ])
      
      setStokvel(stokvelRes.data)
      console.log('Enrollments:', enrollmentsRes.data)
      // Set members as enrollments for now, or fetch user details separately
      setMembers(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [])
      setContributions(Array.isArray(contributionsRes.data) ? contributionsRes.data : [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch stokvel data')
      console.error(err)
      // Ensure arrays are set even on error
      setMembers([])
      setContributions([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await stokvelAPI.addMember(id, memberForm)
      setMemberForm({ name: '', email: '', phone: '' })
      setShowAddMember(false)
      fetchStokvelData()
    } catch (err) {
      console.error('Failed to add member:', err)
    }
  }
  
  const handleAddContribution = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...contributionForm,
        amount: parseFloat(contributionForm.amount),
        member_id: parseInt(contributionForm.member_id)
      }
      await stokvelAPI.makeContribution(data)
      setContributionForm({ member_id: '', amount: '', notes: '' })
      setShowAddContribution(false)
      fetchStokvelData()
    } catch (err) {
      console.error('Failed to add contribution:', err)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error || !stokvel) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">{error || 'Stokvel not found'}</div>
        <button
          onClick={() => navigate('/stokvels')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Stokvels
        </button>
      </div>
    )
  }
  
  const totalContributions = Array.isArray(contributions) 
    ? contributions.reduce((sum, contrib) => sum + (parseFloat(contrib.amount) || 0), 0)
    : 0
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/stokvels')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{stokvel.name}</h1>
        </div>
        
        <button
          onClick={() => navigate(`/payment/${stokvel.id}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <DollarSign className="h-4 w-4" />
          <span>Make Payment</span>
        </button>
      </div>
      
      {/* Stokvel Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-2xl font-bold">{Array.isArray(members) ? members.length : 0}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <DollarSign className="h-10 w-10 text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold">R {totalContributions.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-10 w-10 text-purple-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Contribution</p>
              <p className="text-lg font-semibold">R {stokvel.contribution_amount} / {stokvel.contribution_frequency}</p>
            </div>
          </div>
        </div>
        
        {stokvel.goal && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-700">{stokvel.goal}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Members Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Members ({Array.isArray(members) ? members.length : 0})</h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          </div>
          
          <div className="p-6">
            {showAddMember && (
              <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                    className="w-full rounded border-gray-300"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                    className="w-full rounded border-gray-300"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                    className="w-full rounded border-gray-300"
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Add Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {!Array.isArray(members) || members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No members yet</p>
            ) : (
              <div className="space-y-4">
                {members.map((enrollment) => (
                  <div key={enrollment.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">User ID: {enrollment.userid}</p>
                      <p className="text-sm text-gray-600">{enrollment.isAdmin ? 'Admin' : 'Member'}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Contributions Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Contributions</h2>
            {Array.isArray(members) && members.length > 0 && (
              <button
                onClick={() => setShowAddContribution(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Contribution</span>
              </button>
            )}
          </div>
          
          <div className="p-6">
            {showAddContribution && (
              <form onSubmit={handleAddContribution} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <select
                    value={contributionForm.member_id}
                    onChange={(e) => setContributionForm({...contributionForm, member_id: e.target.value})}
                    className="w-full rounded border-gray-300"
                    required
                  >
                    <option value="">Select Member</option>
                    {Array.isArray(members) && members.map((enrollment) => (
                      <option key={enrollment.id} value={enrollment.userid}>User ID: {enrollment.userid}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    step="0.01"
                    value={contributionForm.amount}
                    onChange={(e) => setContributionForm({...contributionForm, amount: e.target.value})}
                    className="w-full rounded border-gray-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={contributionForm.notes}
                    onChange={(e) => setContributionForm({...contributionForm, notes: e.target.value})}
                    className="w-full rounded border-gray-300"
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      Add Contribution
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddContribution(false)}
                      className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {!Array.isArray(contributions) || contributions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contributions yet</p>
            ) : (
              <div className="space-y-4">
                {Array.isArray(contributions) && contributions.slice(0, 10).map((contribution) => {
                  const enrollment = Array.isArray(members) ? members.find(m => m.userid === contribution.userid) : null
                  return (
                    <div key={contribution.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">User ID: {contribution.userid}</p>
                        <p className="text-sm text-gray-600">R {contribution.amount}</p>
                        {contribution.notes && (
                          <p className="text-xs text-gray-500">{contribution.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(contribution.payment_date).toLocaleDateString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}