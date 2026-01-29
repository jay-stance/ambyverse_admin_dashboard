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
  Activity,
  TrendingUp,
  Heart,
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { AnalyticsData } from '@/lib/types';
import { analyticsApi } from '@/lib/api/admin';

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={`text-sm ${trend ? trendColors[trend] : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PainTrendsChart({ data }: { data: AnalyticsData['painTrends'] }) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Pain Levels & Crisis Frequency Trends</CardTitle>
        <CardDescription>Daily average pain levels and crisis events across all warriors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="crisisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="avgPain"
                stroke="#f97316"
                fill="url(#painGradient)"
                name="Avg Pain Level"
              />
              <Area
                type="monotone"
                dataKey="crisisCount"
                stroke="#ef4444"
                fill="url(#crisisGradient)"
                name="Crisis Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function GenderDistributionChart({ data }: { data: AnalyticsData['genderDistribution'] }) {
  const chartData = [
    { name: 'Male', value: data.male, color: '#6366f1' },
    { name: 'Female', value: data.female, color: '#ec4899' },
    { name: 'Other/Not Specified', value: data.other, color: '#8b5cf6' },
  ].filter(item => item.value > 0); // Only show categories with data

  const total = data.male + data.female + data.other;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
          <CardDescription>Distribution of warriors by gender identity</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No gender data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Distribution of warriors by gender identity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CrisisSeverityChart({ data }: { data: AnalyticsData['crisisSeverity'] }) {
  const chartData = [
    { name: 'Mild (1-3)', value: data.mild, color: '#22c55e' },
    { name: 'Moderate (4-6)', value: data.moderate, color: '#f97316' },
    { name: 'Severe (7-10)', value: data.severe, color: '#ef4444' },
  ];

  const total = data.mild + data.moderate + data.severe;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crisis Severity Distribution</CardTitle>
          <CardDescription>Breakdown of crisis events by severity level</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No crisis data for selected period
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crisis Severity Distribution</CardTitle>
        <CardDescription>Breakdown of crisis events by severity level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-medium">{item.value} events</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${(item.value / total) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AgeDistributionChart({ data }: { data: AnalyticsData['ageDistribution'] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution of Warriors</CardTitle>
          <CardDescription>Breakdown by age groups</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No age data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Distribution of Warriors</CardTitle>
        <CardDescription>Breakdown by age groups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="range" type="category" stroke="#64748b" fontSize={12} width={50} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationAdherenceChart({ data }: { data?: Array<{ week: string; adherence: number }> }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Adherence Trend</CardTitle>
          <CardDescription>Weekly adherence rates based on activity tracking</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No adherence data for selected period
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Adherence Trend</CardTitle>
        <CardDescription>Weekly adherence rates based on completed tasks and streaks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="adherence" name="Adherence %" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async (range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (range) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // 30d
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const analyticsData = await analyticsApi.getData({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      });

      setData(analyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform insights and trends</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <p className="text-lg font-medium mb-2">Unable to load analytics</p>
            <p className="text-sm text-muted-foreground">{error || 'An error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform insights and trends</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Avg Pain Level"
          value={data.avgPainLevel.toFixed(1)}
          subtitle={data.totalEntries > 0 ? `${data.totalEntries} entries` : 'No data'}
          icon={Activity}
          trend={data.avgPainLevel < 5 ? 'down' : data.avgPainLevel > 6 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Total Entries"
          value={data.totalEntries.toLocaleString()}
          subtitle={`From ${data.activeWarriors} warriors`}
          icon={Heart}
        />
        <StatsCard
          title="Medication Adherence"
          value={data.medicationAdherence > 0 ? `${data.medicationAdherence}%` : 'N/A'}
          subtitle={data.medicationAdherence >= 80 ? "Above target" : data.medicationAdherence > 0 ? "Below target" : "No data"}
          icon={CheckCircle2}
          trend={data.medicationAdherence >= 80 ? 'up' : data.medicationAdherence > 0 ? 'down' : 'neutral'}
        />
        <StatsCard
          title="Active Warriors"
          value={data.activeWarriors.toLocaleString()}
          subtitle="Logged activity"
          icon={Users}
        />
      </div>

      {/* Pain Trends */}
      {data.painTrends.length > 0 ? (
        <PainTrendsChart data={data.painTrends} />
      ) : (
        <Card className="col-span-full">
          <CardContent className="py-12 text-center text-muted-foreground">
            No pain trend data for selected period
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenderDistributionChart data={data.genderDistribution} />
        <CrisisSeverityChart data={data.crisisSeverity} />
      </div>

      {/* Age and Medication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgeDistributionChart data={data.ageDistribution} />
        <MedicationAdherenceChart data={data.medicationAdherenceData} />
      </div>

      {/* Info Note */}
      {data.totalEntries === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">No Analytics Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analytics will appear here once warriors start logging pain levels and completing activities. 
                  Encourage users to engage with the platform to generate insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
