import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Bell, LogOut, Plus, Users, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';
import { AuthForm } from './components/auth-form';
import { Dashboard } from './components/dashboard';
import { StokvelCreation } from './components/stokvel-creation';
import { StokvelDetails } from './components/stokvel-details';
import { DocumentUpload } from './components/document-upload';
import { EmergencyWithdrawal } from './components/emergency-withdrawal';
import { Portfolio } from './components/portfolio';
import { NotificationBell } from './components/notifications';

// Auth Context
interface AuthContextType {
  user: any;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, idNumber: string, phoneNumber: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStokvel, setSelectedStokvel] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setUser(session.user);
          setAccessToken(session.access_token);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Sign in error: ${error.message}`);
        return false;
      }

      if (session) {
        setUser(session.user);
        setAccessToken(session.access_token);
        toast.success('Signed in successfully!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string, idNumber: string, phoneNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, idNumber, phoneNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Sign up error: ${errorData.error}`);
        return false;
      }

      toast.success('Account created successfully! Please sign in.');
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setActiveTab('dashboard');
      setSelectedStokvel(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, accessToken, signIn, signUp, signOut }}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
          <AuthForm />
          <Toaster />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, signIn, signUp, signOut }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h1 className="text-xl text-gray-900">Stokvel Digital</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="text-sm text-gray-600">
                  Welcome, {user?.user_metadata?.name || user?.email}
                </div>
                <Button onClick={signOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedStokvel ? (
            <div>
              <Button 
                onClick={() => setSelectedStokvel(null)} 
                variant="ghost" 
                className="mb-6"
              >
                ← Back to Dashboard
              </Button>
              <StokvelDetails stokvelId={selectedStokvel} />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="create">Create Stokvel</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <Dashboard onSelectStokvel={setSelectedStokvel} onNavigateToCreate={() => setActiveTab('create')} />
              </TabsContent>

              <TabsContent value="create">
                <StokvelCreation />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentUpload />
              </TabsContent>

              <TabsContent value="emergency">
                <EmergencyWithdrawal />
              </TabsContent>

              <TabsContent value="portfolio">
                <Portfolio />
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your account and verification status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p>{user?.user_metadata?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p>{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">ID Number</label>
                      <p>{user?.user_metadata?.idNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone Number</label>
                      <p>{user?.user_metadata?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Verification Status</label>
                      <Badge variant="secondary">Pending Verification</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}