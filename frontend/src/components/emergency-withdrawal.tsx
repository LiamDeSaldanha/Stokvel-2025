import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, ThumbsUp, ThumbsDown, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface EmergencyRequest {
  id: string;
  stokvelId: string;
  requesterId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: Array<{
    userId: string;
    vote: 'approve' | 'reject';
    votedAt: string;
  }>;
  createdAt: string;
}

export function EmergencyWithdrawal() {
  const { accessToken, user } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [stokvels, setStokvels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    stokvelId: '',
    amount: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's stokvels
      const stokvelResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/user/stokvels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (stokvelResponse.ok) {
        const stokvelData = await stokvelResponse.json();
        setStokvels(stokvelData.stokvels || []);
      }

      // In a real implementation, we would fetch emergency requests from the backend
      // For now, we'll show mock data
      setRequests([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.stokvelId || !formData.amount || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/emergency-withdrawal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stokvelId: formData.stokvelId,
          amount: parseFloat(formData.amount),
          reason: formData.reason
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to create withdrawal request');
        return;
      }

      toast.success('Emergency withdrawal request created successfully!');
      setIsCreateDialogOpen(false);
      setFormData({ stokvelId: '', amount: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create withdrawal request');
    }
  };

  const handleVote = async (requestId: string, vote: 'approve' | 'reject') => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/emergency-withdrawal/${requestId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to vote');
        return;
      }

      toast.success(`Vote ${vote}d successfully!`);
      fetchData();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const calculateVoteProgress = (request: EmergencyRequest) => {
    const stokvel = stokvels.find(s => s.id === request.stokvelId);
    if (!stokvel) return { approvals: 0, total: 0, percentage: 0 };
    
    const approvals = request.votes.filter(v => v.vote === 'approve').length;
    const total = stokvel.members.length;
    const percentage = (approvals / total) * 100;
    
    return { approvals, total, percentage };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Emergency Withdrawals</h1>
          <p className="text-gray-600">
            Request emergency funds or vote on pending requests
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={stokvels.length === 0}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Emergency Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Emergency Withdrawal Request</DialogTitle>
              <DialogDescription>
                Create a request for emergency funds. Requires 60% member approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stokvel">Stokvel</Label>
                <select
                  id="stokvel"
                  value={formData.stokvelId}
                  onChange={(e) => setFormData(prev => ({ ...prev, stokvelId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a stokvel</option>
                  {stokvels.map((stokvel) => (
                    <option key={stokvel.id} value={stokvel.id}>
                      {stokvel.name} (R{stokvel.totalContributions.toLocaleString()} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ZAR)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount needed"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Emergency</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you need emergency funds..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Important Notice</p>
                    <p className="text-yellow-800">
                      Emergency withdrawals require approval from at least 60% of stokvel members. 
                      All votes are transparent and documented.
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateRequest} className="w-full">
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Emergency Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Submit request with reason</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Members vote within 48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>60% approval required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span>Funds released if approved</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Valid Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Medical emergencies</li>
              <li>• Job loss or income reduction</li>
              <li>• Family crisis situations</li>
              <li>• Home or property damage</li>
              <li>• Educational emergencies</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Request emergency funds</li>
              <li>• Vote on all requests</li>
              <li>• View voting transparency</li>
              <li>• Appeal rejected requests</li>
              <li>• Access fund history</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Requests</CardTitle>
          <CardDescription>
            Active and recent emergency withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No Emergency Requests</h3>
              <p>
                There are currently no emergency withdrawal requests. 
                {stokvels.length === 0 ? ' Join a stokvel to participate in emergency voting.' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => {
                const stokvel = stokvels.find(s => s.id === request.stokvelId);
                const { approvals, total, percentage } = calculateVoteProgress(request);
                const userHasVoted = request.votes.some(v => v.userId === user?.id);
                const userVote = request.votes.find(v => v.userId === user?.id);

                return (
                  <div key={request.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="font-medium">Emergency Withdrawal Request</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-gray-600">
                          From {stokvel?.name} • Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl">R{request.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">requested</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Reason</h4>
                      <p className="text-gray-700">{request.reason}</p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Approval Progress</span>
                          <span>{approvals}/{total} members ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2 mb-2" />
                        <div className="text-xs text-gray-600">
                          Requires 60% approval ({Math.ceil(total * 0.6)} votes needed)
                        </div>
                      </div>
                    )}

                    {request.status === 'pending' && !userHasVoted && request.requesterId !== user?.id && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleVote(request.id, 'approve')}
                          className="flex-1"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleVote(request.id, 'reject')}
                          variant="outline"
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {userHasVoted && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          You voted to <strong>{userVote?.vote}</strong> this request
                        </p>
                      </div>
                    )}

                    {request.requesterId === user?.id && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          This is your request. You cannot vote on your own emergency withdrawal.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}