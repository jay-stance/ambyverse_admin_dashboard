'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ClipboardList, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Pill,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { TaskRequest, TaskStatus, RequestType, GuardianApprovalState } from '@/lib/types';
import { tasksApi } from '@/lib/api/admin';

const statusConfig: Record<TaskStatus, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-700', icon: Activity },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const approvalConfig: Record<GuardianApprovalState, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const typeConfig: Record<RequestType, { icon: React.ElementType; label: string }> = {
  medication_reminder: { icon: Pill, label: 'Medication' },
  health_assessment: { icon: Stethoscope, label: 'Assessment' },
  therapy_session: { icon: Activity, label: 'Therapy' },
  vital_monitoring: { icon: HeartPulse, label: 'Vitals' },
};

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'text-gray-600' },
  2: { label: 'Medium', color: 'text-yellow-600' },
  3: { label: 'High', color: 'text-red-600' },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tasksApi.getAll({ limit: 100 });
      setTasks(result.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.task_status === 'pending').length,
    inProgress: tasks.filter(t => t.task_status === 'in_progress').length,
    completed: tasks.filter(t => t.task_status === 'completed').length,
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.task_status === statusFilter;
    const matchesType = typeFilter === 'all' || task.request_type === typeFilter;
    return matchesStatus && matchesType;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Task Management
          </CardTitle>
          <CardDescription>
            Monitor all task requests across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
              <p className="text-sm text-blue-600">In Progress</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
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
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="medication_reminder">Medication</SelectItem>
                <SelectItem value="health_assessment">Assessment</SelectItem>
                <SelectItem value="therapy_session">Therapy</SelectItem>
                <SelectItem value="vital_monitoring">Vitals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
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
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {tasks.length === 0 ? 'No tasks found in the system.' : 'No tasks found matching your criteria.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Warrior</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Guardian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const StatusIcon = statusConfig[task.task_status].icon;
                    const ApprovalIcon = approvalConfig[task.guardian_approval_state].icon;
                    const TypeIcon = typeConfig[task.request_type].icon;
                    const priority = priorityLabels[task.priority_level || 1];

                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {task.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{task.warrior_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            {typeConfig[task.request_type].label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={priority.color}>{priority.label}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.due_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[task.task_status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {task.task_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={approvalConfig[task.guardian_approval_state].color}>
                            <ApprovalIcon className="h-3 w-3 mr-1" />
                            {task.guardian_approval_state}
                          </Badge>
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
