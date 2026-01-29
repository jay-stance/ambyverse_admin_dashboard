'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download,
  Calendar,
  FileSpreadsheet,
  File,
  Clock,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';

const reportTypes = [
  { 
    id: 'user_summary', 
    name: 'User Summary Report', 
    description: 'Overview of all users, roles, and registration trends',
    icon: Users,
  },
  { 
    id: 'pain_analytics', 
    name: 'Pain Analytics Report', 
    description: 'Detailed pain level analysis and crisis events',
    icon: Activity,
  },
  { 
    id: 'engagement', 
    name: 'Engagement Report', 
    description: 'User activity, connections, and platform usage',
    icon: TrendingUp,
  },
  { 
    id: 'task_completion', 
    name: 'Task Completion Report', 
    description: 'Task assignments and completion rates',
    icon: CheckCircle2,
  },
];

const recentReports = [
  {
    id: '1',
    name: 'User Summary Report - November 2024',
    type: 'user_summary',
    format: 'PDF',
    generated_at: '2024-11-15T10:00:00Z',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Pain Analytics Report - Q3 2024',
    type: 'pain_analytics',
    format: 'Excel',
    generated_at: '2024-10-01T14:00:00Z',
    size: '5.1 MB',
  },
  {
    id: '3',
    name: 'Engagement Report - October 2024',
    type: 'engagement',
    format: 'CSV',
    generated_at: '2024-11-01T09:00:00Z',
    size: '1.8 MB',
  },
];

const formatIcons: Record<string, React.ElementType> = {
  PDF: File,
  Excel: FileSpreadsheet,
  CSV: FileText,
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const selectedReport = reportTypes.find(r => r.id === reportType);

  const handleGenerate = async () => {
    if (!reportType || !startDate || !endDate) return;
    
    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    setGenerated(true);
    
    setTimeout(() => setGenerated(false), 3000);
  };

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
      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Create custom reports for analysis and record keeping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    reportType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <type.icon className={`h-5 w-5 mt-0.5 ${
                      reportType === type.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!reportType || !startDate || !endDate || generating}
            className="w-full gap-2"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : generated ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Report Generated! Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>

          {selectedReport && (
            <p className="text-sm text-muted-foreground text-center">
              Selected: <strong>{selectedReport.name}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>
            Previously generated reports available for download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => {
              const FormatIcon = formatIcons[report.format] || FileText;
              
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <FormatIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.generated_at)}
                        </span>
                        <Badge variant="outline">{report.format}</Badge>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
