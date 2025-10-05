import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Download, Eye, FileText } from 'lucide-react';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface PortfolioData {
  totalInvested: number;
  totalReturns: number;
  activeStokvelCount: number;
  monthlyContributions: number;
  stokvels: Array<{
    id: string;
    name: string;
    contribution: number;
    totalPaid: number;
    expectedReturn: number;
    status: string;
    members: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  monthlyData: Array<{
    month: string;
    contributions: number;
    payouts: number;
  }>;
  statements: Array<{
    id: string;
    period: string;
    type: 'monthly' | 'quarterly' | 'annual';
    generated: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function Portfolio() {
  const { accessToken } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // In a real implementation, this would fetch from the backend
      // For now, we'll generate mock data based on user's stokvels
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/user/stokvels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const stokvels = data.stokvels || [];
        
        // Generate mock portfolio data
        const mockPortfolioData: PortfolioData = {
          totalInvested: stokvels.reduce((sum: number, s: any) => sum + (s.contributionAmount * s.currentCycle), 0),
          totalReturns: 0,
          activeStokvelCount: stokvels.length,
          monthlyContributions: stokvels.reduce((sum: number, s: any) => sum + s.contributionAmount, 0),
          stokvels: stokvels.map((s: any) => ({
            id: s.id,
            name: s.name,
            contribution: s.contributionAmount,
            totalPaid: s.contributionAmount * s.currentCycle,
            expectedReturn: s.totalContributions / s.members.length,
            status: s.isActive ? 'active' : 'inactive',
            members: s.members.length,
            riskLevel: s.members.length > 10 ? 'low' : s.members.length > 5 ? 'medium' : 'high'
          })),
          monthlyData: [
            { month: 'Jan', contributions: 5000, payouts: 0 },
            { month: 'Feb', contributions: 5000, payouts: 0 },
            { month: 'Mar', contributions: 5000, payouts: 15000 },
            { month: 'Apr', contributions: 5000, payouts: 0 },
            { month: 'May', contributions: 5000, payouts: 0 },
            { month: 'Jun', contributions: 5000, payouts: 15000 },
          ],
          statements: [
            { id: '1', period: 'May 2024', type: 'monthly', generated: '2024-06-01' },
            { id: '2', period: 'Q1 2024', type: 'quarterly', generated: '2024-04-01' },
            { id: '3', period: 'Q4 2023', type: 'quarterly', generated: '2024-01-01' },
          ]
        };

        setPortfolioData(mockPortfolioData);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadStatement = (statementId: string) => {
    toast.success('Statement download started (feature simulated)');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg mb-2">No Portfolio Data</h3>
          <p className="text-gray-600">
            Join some stokvels to start building your portfolio.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pieChartData = portfolioData.stokvels.map((stokvel, index) => ({
    name: stokvel.name,
    value: stokvel.totalPaid,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Portfolio Overview</h1>
        <p className="text-gray-600">
          Track your stokvel investments, returns, and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R{portfolioData.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {portfolioData.activeStokvelCount} stokvels
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R{portfolioData.totalReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              0% ROI (first cycle)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Stokvels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{portfolioData.activeStokvelCount}</div>
            <p className="text-xs text-muted-foreground">
              Participating actively
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Monthly Contributions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">R{portfolioData.monthlyContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current commitments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Distribution</CardTitle>
            <CardDescription>
              How your investments are distributed across stokvels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>
              Your contributions vs payouts over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portfolioData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R${Number(value).toLocaleString()}`, '']} />
                <Bar dataKey="contributions" fill="#8884d8" name="Contributions" />
                <Bar dataKey="payouts" fill="#82ca9d" name="Payouts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Portfolio */}
      <Tabs defaultValue="stokvels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stokvels">My Stokvels</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="stokvels">
          <Card>
            <CardHeader>
              <CardTitle>Stokvel Portfolio</CardTitle>
              <CardDescription>
                Detailed view of your stokvel investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stokvel Name</TableHead>
                    <TableHead>Monthly Contribution</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioData.stokvels.map((stokvel) => (
                    <TableRow key={stokvel.id}>
                      <TableCell className="font-medium">{stokvel.name}</TableCell>
                      <TableCell>R{stokvel.contribution.toLocaleString()}</TableCell>
                      <TableCell>R{stokvel.totalPaid.toLocaleString()}</TableCell>
                      <TableCell>R{stokvel.expectedReturn.toLocaleString()}</TableCell>
                      <TableCell>{stokvel.members}</TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(stokvel.riskLevel)}>
                          {stokvel.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stokvel.status === 'active' ? 'default' : 'secondary'}>
                          {stokvel.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Your stokvel performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Consistency</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Return on Investment</span>
                    <span>0% (First Cycle)</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Diversification Score</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Portfolio risk analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Overall Risk</span>
                    <Badge className="bg-green-100 text-green-800">LOW</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>Liquidity Risk</span>
                    <Badge className="bg-blue-100 text-blue-800">MEDIUM</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Default Risk</span>
                    <Badge className="bg-green-100 text-green-800">LOW</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Statements & Documents</CardTitle>
              <CardDescription>
                Download your stokvel statements and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.statements.map((statement) => (
                  <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{statement.period} Statement</p>
                        <p className="text-sm text-gray-600">
                          {statement.type.charAt(0).toUpperCase() + statement.type.slice(1)} report
                        </p>
                        <p className="text-xs text-gray-500">
                          Generated {new Date(statement.generated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        onClick={() => downloadStatement(statement.id)}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}