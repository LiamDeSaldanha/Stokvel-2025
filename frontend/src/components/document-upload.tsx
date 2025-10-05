import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  uploadedAt: string;
}

export function DocumentUpload() {
  const { accessToken } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'id', label: 'ID Document', description: 'South African ID card or passport' },
    { value: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or bank statement (max 3 months old)' },
    { value: 'bank_statement', label: 'Bank Statement', description: '3 months bank statements' },
    { value: 'income_proof', label: 'Proof of Income', description: 'Salary slip or employment letter' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      toast.error('Please select a document type first');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    uploadDocument(file);
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);

    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll simulate the upload
      const mockFileUrl = `https://example.com/documents/${file.name}`;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a76bd4ad/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          fileName: file.name,
          fileUrl: mockFileUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload document');
        return;
      }

      const result = await response.json();
      setDocuments(prev => [...prev, result.document]);
      toast.success('Document uploaded successfully! Verification in progress.');
      
      // Reset form
      setSelectedType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType?.label || type;
  };

  const verificationProgress = documents.length > 0 
    ? (documents.filter(d => d.status === 'verified').length / documents.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Document Verification</h1>
        <p className="text-gray-600">
          Upload your documents for verification to join stokvels and access all features
        </p>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
          <CardDescription>
            Complete your verification to unlock all stokvel features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Documents Verified</span>
              <span>{documents.filter(d => d.status === 'verified').length} of {documents.length}</span>
            </div>
            <Progress value={verificationProgress} className="h-3" />
            
            {verificationProgress === 100 && documents.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Verification Complete!</p>
                  <p className="text-sm text-green-700">You can now access all stokvel features.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Select document type and upload your file (JPEG, PNG, or PDF, max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedType ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {selectedType ? 'Click to upload or drag and drop' : 'Select document type first'}
              </p>
              <p className="text-sm text-gray-600">
                JPEG, PNG or PDF files up to 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              disabled={!selectedType || uploading}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedType || uploading}
              className="mt-4"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
          <CardDescription>
            Ensure your documents meet these requirements for faster verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTypes.map((type) => (
              <div key={type.value} className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {type.label}
                </h4>
                <p className="text-sm text-gray-600">{type.description}</p>
                <div className="text-xs text-gray-500">
                  Requirements: Clear, readable, valid, and recent
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Track the status of your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium">{getDocumentTypeLabel(doc.type)}</p>
                      <p className="text-sm text-gray-600">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    {doc.status === 'rejected' && (
                      <Button size="sm" variant="outline">
                        Re-upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">Do's</h4>
              <ul className="text-sm space-y-1 text-green-800">
                <li>• Ensure documents are clear and readable</li>
                <li>• Use good lighting when taking photos</li>
                <li>• Ensure all corners are visible</li>
                <li>• Use original documents</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-900">Don'ts</h4>
              <ul className="text-sm space-y-1 text-red-800">
                <li>• Don't upload blurry or dark images</li>
                <li>• Don't crop important information</li>
                <li>• Don't upload expired documents</li>
                <li>• Don't edit or modify documents</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}