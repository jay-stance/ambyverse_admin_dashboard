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
  Activity, 
  Calendar,
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { PainLog } from '@/lib/types';
import { painLogsApi } from '@/lib/api/admin';

function getPainLevelColor(level: number): string {
  if (level <= 3) return 'bg-green-100 text-green-700';
  if (level <= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function PainLogsPage() {
  const [logs, setLogs] = useState<PainLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [crisisFilter, setCrisisFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await painLogsApi.getLogs({ limit: 100 });
      setLogs(result.logs);
    } catch (err) {
      console.error('Failed to fetch pain logs:', err);
      setError('Failed to load pain logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const stats = {
    total: logs.length,
    crisisEvents: logs.filter(l => l.is_crisis).length,
    avgPainLevel: logs.length > 0 
      ? (logs.reduce((sum, l) => sum + l.pain_level, 0) / logs.length).toFixed(1)
      : '0',
    highSeverity: logs.filter(l => l.pain_level >= 7).length,
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.warrior_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesCrisis = crisisFilter === 'all' || 
      (crisisFilter === 'crisis' && log.is_crisis) ||
      (crisisFilter === 'normal' && !log.is_crisis);
    const matchesSeverity = severityFilter === 'all' ||
      (severityFilter === 'low' && log.pain_level <= 3) ||
      (severityFilter === 'moderate' && log.pain_level > 3 && log.pain_level <= 6) ||
      (severityFilter === 'high' && log.pain_level > 6);
    return matchesSearch && matchesCrisis && matchesSeverity;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pain Logs Dashboard
          </CardTitle>
          <CardDescription>
            Monitor pain levels and crisis events across all warriors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">{stats.crisisEvents}</p>
              <p className="text-sm text-red-600">Crisis Events</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-700">{stats.avgPainLevel}</p>
              <p className="text-sm text-orange-600">Avg Pain Level</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.highSeverity}</p>
              <p className="text-sm text-yellow-600">High Severity</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by warrior name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={crisisFilter} onValueChange={setCrisisFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Crisis filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="crisis">Crisis Only</SelectItem>
                <SelectItem value="normal">Normal Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low (1-3)</SelectItem>
                <SelectItem value="moderate">Moderate (4-6)</SelectItem>
                <SelectItem value="high">High (7-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pain Logs Table */}
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
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {logs.length === 0 ? 'No pain logs found in the system.' : 'No pain logs found matching your criteria.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warrior</TableHead>
                    <TableHead>Pain Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Logged At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className={log.is_crisis ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-medium">
                        {log.warrior_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getPainLevelColor(log.pain_level)}>
                            {log.pain_level}/10
                          </Badge>
                          {log.pain_level >= 7 ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : log.pain_level <= 3 ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.is_crisis ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Crisis
                          </Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {log.notes || 'No notes'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(log.logged_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
