'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Link2, 
  ArrowRight,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Connection, ConnectionStatus } from '@/lib/types';
import { connectionsApi } from '@/lib/api/admin';

const statusColors: Record<ConnectionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const roleColors: Record<string, string> = {
  warrior: 'bg-red-100 text-red-700',
  guardian: 'bg-blue-100 text-blue-700',
  caregiver: 'bg-green-100 text-green-700',
};

function ConnectionCard({ connection }: { connection: Connection }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-4">
        <Badge className={statusColors[connection.status]}>
          {connection.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
          {connection.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {connection.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
          {connection.status}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(connection.created_at)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Requester */}
        <div className="flex-1 text-center">
          <Avatar className="h-12 w-12 mx-auto mb-2">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(connection.requester_name || '')}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium text-sm">{connection.requester_name}</p>
          <Badge variant="outline" className={`text-xs ${roleColors[connection.requester_role]}`}>
            {connection.requester_role}
          </Badge>
        </div>

        {/* Arrow */}
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* Recipient */}
        <div className="flex-1 text-center">
          <Avatar className="h-12 w-12 mx-auto mb-2">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(connection.recipient_name || '')}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium text-sm">{connection.recipient_name}</p>
          <Badge variant="outline" className={`text-xs ${roleColors[connection.recipient_role]}`}>
            {connection.recipient_role}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
            <Skeleton className="h-5 w-5" />
            <div className="flex-1 text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await connectionsApi.getAll({ limit: 100 });
      setConnections(result.connections);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const stats = {
    total: connections.length,
    pending: connections.filter(c => c.status === 'pending').length,
    accepted: connections.filter(c => c.status === 'accepted').length,
    rejected: connections.filter(c => c.status === 'rejected').length,
  };

  const filteredConnections = connections.filter((connection) => {
    const matchesStatus = statusFilter === 'all' || connection.status === statusFilter;
    const matchesRole = roleFilter === 'all' || 
      connection.requester_role === roleFilter || 
      connection.recipient_role === roleFilter;
    return matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connection Management
          </CardTitle>
          <CardDescription>
            View all connections between warriors, guardians, and caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
              <p className="text-sm text-green-600">Accepted</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="warrior">Warriors</SelectItem>
                <SelectItem value="guardian">Guardians</SelectItem>
                <SelectItem value="caregiver">Caregivers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Connections Grid */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredConnections.length} of {connections.length} connections
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : filteredConnections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {connections.length === 0 ? 'No connections found in the system.' : 'No connections found matching your criteria.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      )}
    </div>
  );
}
