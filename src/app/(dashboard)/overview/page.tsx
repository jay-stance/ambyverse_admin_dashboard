'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserCheck, 
  BadgeCheck, 
  AlertTriangle,
  Users2,
  MessageSquare,
  FileText,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { DashboardStats } from '@/lib/types';

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendLabel,
  variant = 'default'
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-500',
    danger: 'text-red-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend !== undefined && (
              <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {trend >= 0 ? '+' : ''}{trend}% {trendLabel}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDistribution({ data }: { data: DashboardStats['userDistribution'] }) {
  const total = data.warriors + data.guardians + data.caregivers + (data.admins || 0);
  
  const roles = [
    { name: 'Warriors (Patients)', count: data.warriors, color: 'bg-red-500' },
    { name: 'Parents/Guardians', count: data.guardians, color: 'bg-primary' },
    { name: 'Caregivers (Medical)', count: data.caregivers, color: 'bg-green-500' },
    { name: 'Admins', count: data.admins || 0, color: 'bg-purple-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          User Distribution by Role
        </CardTitle>
        <CardDescription>Breakdown of registered users across different roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role) => (
          <div key={role.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${role.color}`} />
                {role.name}
              </span>
              <span className="font-medium">{role.count.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${role.color} transition-all`}
                style={{ width: `${total ? (role.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PlatformActivity({ data }: { data: DashboardStats['platformActivity'] }) {
  const activities = [
    { label: 'Total Connections', value: data.totalConnections.toLocaleString() },
    { label: 'Messages Sent', value: data.messagesSent.toLocaleString() },
    { label: 'Reports Generated', value: data.reportsGenerated.toLocaleString() },
    { label: 'Avg Pain Level', value: `${data.avgPainLevel}/10` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Platform Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.label} className="flex justify-between items-center">
              <span className="text-muted-foreground">{activity.label}</span>
              <span className="font-semibold">{activity.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Manage Users', href: '/users', icon: Users },
    { label: 'Review Verifications', href: '/verify', icon: BadgeCheck, badge: 5 },
    { label: 'Send Broadcast', href: '/broadcast', icon: MessageSquare },
    { label: 'Export Reports', href: '/reports', icon: FileText },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button variant="ghost" className="w-full justify-between h-12">
              <span className="flex items-center gap-3">
                <action.icon className="h-4 w-4" />
                {action.label}
              </span>
              <span className="flex items-center gap-2">
                {action.badge && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                    {action.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={stats.userGrowth}
          trendLabel="this month"
        />
        <StatsCard
          title="Active (24h)"
          value={stats.activeUsers.toLocaleString()}
          subtitle={`${stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total users`}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title="Verified"
          value={stats.verifiedUsers.toLocaleString()}
          subtitle={`${stats.verifiedUsers} pending`}
          icon={BadgeCheck}
          variant="success"
        />
        <StatsCard
          title="Crisis (24h)"
          value={stats.crisisAlerts}
          subtitle="Requires attention"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Distribution and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserDistribution data={stats.userDistribution} />
        <div className="space-y-6">
          <PlatformActivity data={stats.platformActivity} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
