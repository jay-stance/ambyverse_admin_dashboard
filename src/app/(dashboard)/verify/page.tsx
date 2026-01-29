'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BadgeCheck, 
  Building2, 
  Mail, 
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  FileBadge,
  Phone
} from 'lucide-react';
import { VerificationRequest, VerificationStatus } from '@/lib/types';
import { adminApi } from '@/lib/api/admin';

function VerificationCard({ 
  request, 
  onReview 
}: { 
  request: VerificationRequest;
  onReview: (request: VerificationRequest) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold flex items-center gap-2">
            {request.full_name}
            {request.verification_status === 'approved' && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </h3>
          {request.organization_name && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {request.organization_name} {request.organization_type && `(${request.organization_type})`}
            </Badge>
          )}
        </div>
        <Badge className={
          request.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
          request.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-orange-100 text-orange-700'
        }>
          {request.verification_status.charAt(0).toUpperCase() + request.verification_status.slice(1)}
        </Badge>
      </div>

      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        {request.medical_license && (
          <div className="flex items-center gap-2">
            <FileBadge className="h-4 w-4" />
            License: {request.medical_license}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {request.email}
        </div>
        {request.phone_number && (
           <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {request.phone_number}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Submitted {formatDate(request.submitted_at)}
        </div>
      </div>

      {request.verification_note && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          request.verification_status === 'approved' ? 'bg-green-50 text-green-700' : 
          request.verification_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-muted'
        }`}>
          <strong>Note:</strong> {request.verification_note}
          {request.verified_at && (
            <p className="text-xs mt-1 opacity-70">
              Processed on {formatDate(request.verified_at)}
            </p>
          )}
        </div>
      )}

      {request.verification_status === 'pending' && (
        <Button onClick={() => onReview(request)} className="w-full mt-4 gap-2" variant="outline">
          <Eye className="h-4 w-4" />
          Review Application
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      ))}
    </div>
  );
}

export default function VerifyPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = async () => {
    try {
      const data = await adminApi.getVerifications();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to fetch verification requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const pending = verifications.filter(v => v.verification_status === 'pending');
  const approved = verifications.filter(v => v.verification_status === 'approved');
  const rejected = verifications.filter(v => v.verification_status === 'rejected');

  const handleReview = async (status: VerificationStatus) => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const updated = await adminApi.verifyUser(selectedRequest.id, status, reviewNote);
      // Update local state
      setVerifications(prev => prev.map(v => 
        v.id === updated.id ? { ...v, ...updated } : v
      ));
      setSelectedRequest(null);
      setReviewNote('');
    } catch (error) {
      console.error('Failed to update verification status', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5" />
            Verification Management
          </CardTitle>
          <CardDescription>
            Review and approve professional caregivers requesting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <p className="text-3xl font-bold text-orange-600">{pending.length}</p>
              <p className="text-sm text-orange-600">Pending Review</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <p className="text-3xl font-bold text-green-600">{approved.length}</p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <p className="text-3xl font-bold text-red-600">{rejected.length}</p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Professional Verification:</strong> Verified caregivers gain access to advanced patient monitoring features. Ensure valid medical license or institutional affiliation before approving.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="mt-6">
            <LoadingSkeleton />
          </div>
        ) : (
          <>
            <TabsContent value="pending" className="mt-6 space-y-4">
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending verification requests.
                  </CardContent>
                </Card>
              ) : (
                pending.map(request => (
                  <VerificationCard
                    key={request.id}
                    request={request}
                    onReview={setSelectedRequest}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6 space-y-4">
              {approved.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No approved caregivers.
                  </CardContent>
                </Card>
              ) : (
                approved.map(request => (
                  <VerificationCard
                    key={request.id}
                    request={request}
                    onReview={setSelectedRequest}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6 space-y-4">
              {rejected.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No rejected verifications.
                  </CardContent>
                </Card>
              ) : (
                rejected.map(request => (
                  <VerificationCard
                    key={request.id}
                    request={request}
                    onReview={setSelectedRequest}
                  />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Caregiver</DialogTitle>
            <DialogDescription>
              {selectedRequest?.full_name} ({selectedRequest?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p><strong>Role:</strong> Caregiver</p>
              <p><strong>Phone:</strong> {selectedRequest?.phone_number || 'N/A'}</p>
              {selectedRequest?.medical_license && (
                <p><strong>License:</strong> {selectedRequest.medical_license}</p>
              )}
              {selectedRequest?.organization_name && (
                <p><strong>Organization:</strong> {selectedRequest.organization_name} ({selectedRequest.organization_type})</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewNote">Review Note</Label>
              <Textarea
                id="reviewNote"
                placeholder="Add a note about your decision (e.g., Verified license #12345)..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => handleReview('rejected')}
              disabled={processing}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject
            </Button>
            <Button
              onClick={() => handleReview('approved')}
              disabled={processing || (!reviewNote && selectedRequest?.verification_status !== 'pending')} // Optional logic
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
