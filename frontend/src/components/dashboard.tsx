import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, TrendingUp, DollarSign, Calendar, Plus, Search } from 'lucide-react';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Stokvel {
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
}

interface DashboardProps {
  onSelectStokvel: (stokvelId: string) => void;
  onNavigateToCreate?: () => void;
}

export function Dashboard({ onSelectStokvel, onNavigateToCreate }: DashboardProps) {
  const { accessToken } = useAuth();
  const [stokvels, setStokvels] = useState<Stokvel[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserStokvels();
  }, []);

  const fetchUserStokvels = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/user/stokvels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stokvels');
      }

      const data = await response.json();
      setStokvels(data.stokvels || []);
    } catch (error) {
      console.error('Error fetching stokvels:', error);
      toast.error('Failed to load your stokvels');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStokvel = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a stokvel ID');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/stokvels/${joinCode}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to join stokvel');
        return;
      }

      toast.success('Successfully joined stokvel!');
      setIsJoinDialogOpen(false);
      setJoinCode('');
      fetchUserStokvels();
    } catch (error) {
      console.error('Error joining stokvel:', error);
      toast.error('Failed to join stokvel');
    }
  };

  const calculateProgress = (stokvel: Stokvel) => {
    const expectedContributions = stokvel.members.length * stokvel.contributionAmount * stokvel.currentCycle;
    return expectedContributions > 0 ? (stokvel.totalContributions / expectedContributions) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Stokvels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stokvels.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              R{stokvels.reduce((sum, s) => sum + s.totalContributions, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Stokvels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {stokvels.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              R{stokvels.reduce((sum, s) => sum + s.contributionAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expected contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Join Stokvel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Stokvel</DialogTitle>
              <DialogDescription>
                Enter the stokvel ID to join an existing stokvel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter stokvel ID"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <Button onClick={handleJoinStokvel} className="w-full">
                Join Stokvel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stokvels List */}
      <div className="space-y-4">
        <h2 className="text-xl">Your Stokvels</h2>
        
        {stokvels.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No Stokvels Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first stokvel or join an existing one to get started.
              </p>
              <Button onClick={onNavigateToCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Stokvel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stokvels.map((stokvel) => (
              <Card key={stokvel.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{stokvel.name}</CardTitle>
                      <CardDescription>{stokvel.description}</CardDescription>
                    </div>
                    <Badge variant={stokvel.isActive ? "default" : "secondary"}>
                      {stokvel.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Monthly Contribution</p>
                      <p className="font-medium">R{stokvel.contributionAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Members</p>
                      <p className="font-medium">{stokvel.members.length}/{stokvel.maxMembers}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cycle Progress</span>
                      <span>{calculateProgress(stokvel).toFixed(0)}%</span>
                    </div>
                    <Progress value={calculateProgress(stokvel)} className="h-2" />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Total Pool: R{stokvel.totalContributions.toLocaleString()}</p>
                    <p>Cycle {stokvel.currentCycle} • {stokvel.payoutCycle}</p>
                  </div>
                  
                  <Button 
                    onClick={() => onSelectStokvel(stokvel.id)} 
                    className="w-full"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}