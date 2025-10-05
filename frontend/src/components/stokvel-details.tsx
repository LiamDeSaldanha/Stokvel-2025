import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, DollarSign, TrendingUp, AlertTriangle, Copy, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface StokvelDetailsProps {
  stokvelId: string;
}

interface StokvelData {
  stokvel: {
    id: string;
    name: string;
    description: string;
    contributionAmount: number;
    payoutCycle: string;
    maxMembers: number;
    members: string[];
    currentCycle: number;
    totalContributions: number;
    isActive: boolean;
    adminId: string;
    memberDetails: Array<{
      id: string;
      name: string;
      email: string;
      isVerified: boolean;
    }>;
  };
}

interface ContributionData {
  stokvelId: string;
  currentCycle: number;
  memberContributions: Array<{
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    totalPaid: number;
    expectedAmount: number;
    currentCyclePaid: number;
    currentCycleExpected: number;
    isCurrentCycleComplete: boolean;
    lastPaymentDate: string | null;
    paymentHistory: Array<{
      id: string;
      amount: number;
      reference: string;
      date: string;
    }>;
  }>;
  summary: {
    totalMembers: number;
    membersWhoPaid: number;
    totalCollectedThisCycle: number;
    totalExpectedThisCycle: number;
    collectionPercentage: number;
  };
}

interface PaymentHistory {
  payments: Array<{
    id: string;
    stokvelId: string;
    userId: string;
    amount: number;
    type: string;
    reference: string;
    status: string;
    createdAt: string;
    userName: string;
    userEmail: string;
  }>;
}

export function StokvelDetails({ stokvelId }: StokvelDetailsProps) {
  const { accessToken, user } = useAuth();
  const [stokvelData, setStokvelData] = useState<StokvelData | null>(null);
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchStokvelDetails();
    fetchContributionData();
    fetchPaymentHistory();
  }, [stokvelId]);

  const fetchStokvelDetails = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/stokvels/${stokvelId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch stokvel details');
        return;
      }

      const data = await response.json();
      setStokvelData(data);
    } catch (error) {
      console.error('Error fetching stokvel details:', error);
      toast.error('Failed to load stokvel details');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributionData = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/stokvels/${stokvelId}/contributions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContributionData(data);
      }
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/stokvels/${stokvelId}/payments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || !paymentReference) {
      toast.error('Please fill in all payment details');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stokvelId,
          amount: parseFloat(paymentAmount),
          type: 'contribution',
          reference: paymentReference
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to record payment');
        return;
      }

      toast.success('Payment recorded successfully!');
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setPaymentReference('');
      fetchStokvelDetails();
      fetchContributionData();
      fetchPaymentHistory();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const copyStokvelId = () => {
    navigator.clipboard.writeText(stokvelId);
    toast.success('Stokvel ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stokvelData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg mb-2">Stokvel Not Found</h3>
          <p className="text-gray-600">
            The stokvel you're looking for doesn't exist or you don't have access to it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { stokvel } = stokvelData;
  const isAdmin = stokvel.adminId === user?.id;
  const expectedTotal = stokvel.members.length * stokvel.contributionAmount * stokvel.currentCycle;
  const progressPercentage = expectedTotal > 0 ? (stokvel.totalContributions / expectedTotal) * 100 : 0;
  
  // Use contribution data for current cycle stats if available
  const currentCycleStats = contributionData ? {
    collected: contributionData.summary.totalCollectedThisCycle,
    expected: contributionData.summary.totalExpectedThisCycle,
    percentage: contributionData.summary.collectionPercentage,
    membersWhoPaid: contributionData.summary.membersWhoPaid,
    totalMembers: contributionData.summary.totalMembers
  } : {
    collected: 0,
    expected: stokvel.members.length * stokvel.contributionAmount,
    percentage: 0,
    membersWhoPaid: 0,
    totalMembers: stokvel.members.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">{stokvel.name}</h1>
          <p className="text-gray-600 mb-4">{stokvel.description}</p>
          <div className="flex items-center gap-4">
            <Badge variant={stokvel.isActive ? "default" : "secondary"}>
              {stokvel.isActive ? "Active" : "Inactive"}
            </Badge>
            {isAdmin && <Badge variant="outline">Administrator</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyStokvelId}>
            <Copy className="h-4 w-4 mr-2" />
            Copy ID
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Contribution</DialogTitle>
                <DialogDescription>
                  Record a contribution payment to this stokvel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Payment Reference</Label>
                  <Input
                    id="reference"
                    placeholder="e.g., Bank transfer ref: 12345"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>
                <Button onClick={handlePayment} className="w-full">
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Pool (All Time)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R{stokvel.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of R{expectedTotal.toLocaleString()} expected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R{currentCycleStats.collected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of R{currentCycleStats.expected.toLocaleString()} expected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Members Paid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{currentCycleStats.membersWhoPaid}</div>
            <p className="text-xs text-muted-foreground">
              of {currentCycleStats.totalMembers} members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{currentCycleStats.percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Collection Progress</CardTitle>
          <CardDescription>
            Monthly contribution collection status for cycle {stokvel.currentCycle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentCycleStats.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={currentCycleStats.percentage} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>R{currentCycleStats.collected.toLocaleString()} collected</span>
              <span>R{currentCycleStats.expected.toLocaleString()} target</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
              <span>{currentCycleStats.membersWhoPaid} members paid</span>
              <span>{currentCycleStats.totalMembers - currentCycleStats.membersWhoPaid} pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="contributions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contributions">Monthly Contributions</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Contribution Transparency</CardTitle>
              <CardDescription>
                Current month contribution status for all members (Cycle {stokvel.currentCycle})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contributionData ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl text-green-600">{contributionData.summary.membersWhoPaid}</div>
                      <div className="text-sm text-gray-600">Members Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-red-600">{contributionData.summary.totalMembers - contributionData.summary.membersWhoPaid}</div>
                      <div className="text-sm text-gray-600">Members Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-blue-600">R{contributionData.summary.totalCollectedThisCycle.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Collected This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-purple-600">{contributionData.summary.collectionPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Collection Rate</div>
                    </div>
                  </div>

                  {/* Member Contribution Status */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>This Month</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributionData.memberContributions.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <div>{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.isCurrentCycleComplete ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                              {member.id === stokvel.adminId && (
                                <Badge variant="outline" className="text-xs">Admin</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>R{member.currentCyclePaid.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">
                                of R{member.currentCycleExpected.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>R{member.totalPaid.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">
                                of R{member.expectedAmount.toLocaleString()} expected
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.lastPaymentDate ? (
                              <div className="text-sm">
                                {new Date(member.lastPaymentDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No payments</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.isCurrentCycleComplete ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : member.currentCyclePaid > 0 ? (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <div className="text-sm">
                                {member.totalPaid > 0 ? 
                                  `${((member.totalPaid / member.expectedAmount) * 100).toFixed(0)}%` : 
                                  '0%'
                                }
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading contribution data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
              <CardDescription>
                All members and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stokvel.memberDetails.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.isVerified ? "default" : "secondary"}>
                          {member.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.id === stokvel.adminId ? (
                          <Badge variant="outline">Admin</Badge>
                        ) : (
                          "Member"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All contributions and payouts for this stokvel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory && paymentHistory.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{payment.userName}</div>
                            <div className="text-sm text-gray-500">{payment.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {payment.type === 'contribution' ? '+' : '-'}
                            R{payment.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.type === 'contribution' ? 'default' : 'secondary'}>
                            {payment.type === 'contribution' ? 'Contribution' : 'Payout'}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment history available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>
                Member contribution performance and stokvel health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Collection Rate</h4>
                    <div className="text-2xl text-green-600">{currentCycleStats.percentage.toFixed(1)}%</div>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Member Participation</h4>
                    <div className="text-2xl text-blue-600">
                      {contributionData ? 
                        `${((contributionData.summary.membersWhoPaid / contributionData.summary.totalMembers) * 100).toFixed(0)}%` : 
                        '0%'
                      }
                    </div>
                    <p className="text-sm text-gray-600">Members who paid this month</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Total Collected</h4>
                    <div className="text-2xl text-purple-600">R{stokvel.totalContributions.toLocaleString()}</div>
                    <p className="text-sm text-gray-600">All time contributions</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Payment Consistency</span>
                      <Badge variant="secondary" className={`${
                        currentCycleStats.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        currentCycleStats.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentCycleStats.percentage >= 80 ? 'Low Risk' :
                         currentCycleStats.percentage >= 60 ? 'Medium Risk' : 'High Risk'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>Member Verification</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Fund Management</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Low Risk</Badge>
                    </div>
                  </div>
                </div>

                {contributionData && (
                  <div>
                    <h4 className="font-medium mb-4">Member Performance Overview</h4>
                    <div className="space-y-2">
                      {contributionData.memberContributions.map((member) => {
                        const performancePercentage = member.expectedAmount > 0 ? 
                          (member.totalPaid / member.expectedAmount) * 100 : 0;
                        return (
                          <div key={member.id} className="flex justify-between items-center p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div>
                                <div>{member.name}</div>
                                <div className="text-sm text-gray-500">
                                  R{member.totalPaid.toLocaleString()} / R{member.expectedAmount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">{performancePercentage.toFixed(0)}%</div>
                              {member.isCurrentCycleComplete ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}