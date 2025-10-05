import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Users, DollarSign, Calendar, FileText } from 'lucide-react';

export function StokvelCreation() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    payoutCycle: '',
    maxMembers: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/stokvels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          contributionAmount: parseFloat(formData.contributionAmount),
          payoutCycle: formData.payoutCycle,
          maxMembers: parseInt(formData.maxMembers)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to create stokvel');
        return;
      }

      const result = await response.json();
      toast.success('Stokvel created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        contributionAmount: '',
        payoutCycle: '',
        maxMembers: ''
      });

      // Copy stokvel ID to clipboard
      navigator.clipboard.writeText(result.stokvel.id);
      toast.success('Stokvel ID copied to clipboard!');
      
    } catch (error) {
      console.error('Error creating stokvel:', error);
      toast.error('Failed to create stokvel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Create a New Stokvel</h1>
        <p className="text-gray-600">
          Set up your stokvel with transparency and automated management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium">Member Management</h3>
            <p className="text-sm text-gray-600">Automated member verification and tracking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium">Payment Tracking</h3>
            <p className="text-sm text-gray-600">Real-time contribution and payout monitoring</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium">Document Management</h3>
            <p className="text-sm text-gray-600">Secure document storage and verification</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stokvel Details</CardTitle>
          <CardDescription>
            Provide the basic information for your stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Stokvel Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Family Savings Circle"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of your stokvel"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contribution">Monthly Contribution (ZAR) *</Label>
                <Input
                  id="contribution"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g., 1000"
                  value={formData.contributionAmount}
                  onChange={(e) => handleInputChange('contributionAmount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Members *</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="50"
                  placeholder="e.g., 12"
                  value={formData.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutCycle">Payout Cycle *</Label>
              <Select onValueChange={(value) => handleInputChange('payoutCycle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payout frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You will be the administrator of this stokvel</li>
                <li>• Members need to be verified before they can contribute</li>
                <li>• Emergency withdrawals require 60% member approval</li>
                <li>• All transactions are tracked and transparent to members</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Stokvel...' : 'Create Stokvel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}