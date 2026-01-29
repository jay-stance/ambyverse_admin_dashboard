'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  History, 
  Search,
  Calendar,
  User,
  Activity,
  LogIn,
  Heart,
  Link2,
  ClipboardList,
  Flame,
} from 'lucide-react';
import { UserAction } from '@/lib/types';
import { activityApi } from '@/lib/api/admin';

const actionConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  pain_logged: { icon: Heart, label: 'Pain Logged', color: 'bg-red-100 text-red-700' },
  user_logged_in: { icon: LogIn, label: 'Logged In', color: 'bg-blue-100 text-blue-700' },
  connection_accepted: { icon: Link2, label: 'Connection Accepted', color: 'bg-green-100 text-green-700' },
  task_completed: { icon: ClipboardList, label: 'Task Completed', color: 'bg-purple-100 text-purple-700' },
  streak_updated: { icon: Flame, label: 'Streak Updated', color: 'bg-orange-100 text-orange-700' },
  default: { icon: Activity, label: 'Action', color: 'bg-gray-100 text-gray-700' },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function ActivityLogsPage() {
  const [actions, setActions] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app with search/filter params, we'd pass them here.
      // For now, fetching first 100 recent logs.
      const result = await activityApi.getLogs({ limit: 100 });
      setActions(result.logs);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = Array.from(new Set(actions.map(a => a.action_type)));

  const filteredActions = actions.filter((action) => {
    const matchesSearch = 
      action.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      action.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || action.action_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: actions.length,
    today: actions.filter(a => (a.action_date ? a.action_date : new Date(a.action_at).toISOString().split('T')[0]) === new Date().toISOString().split('T')[0]).length,
    uniqueUsers: new Set(actions.map(a => a.user_id)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Audit trail of all user actions on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Actions</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{stats.today}</p>
              <p className="text-sm text-green-600">Today</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.uniqueUsers}</p>
              <p className="text-sm text-blue-600">Unique Users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {actionConfig[type]?.label || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">
              {error}
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {actions.length === 0 ? 'No activity logs found in the system.' : 'No activity logs found matching your criteria.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => {
                    const config = actionConfig[action.action_type] || actionConfig.default;
                    const ActionIcon = config.icon;

                    return (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{action.user_name || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{action.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {action.metadata ? (
                            <div className="max-w-[300px] overflow-hidden text-ellipsis">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {JSON.stringify(action.metadata).slice(0, 50)}
                                {JSON.stringify(action.metadata).length > 50 && '...'}
                              </code>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(action.action_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
