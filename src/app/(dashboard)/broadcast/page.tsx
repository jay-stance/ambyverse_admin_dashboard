'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Megaphone, 
  Users,
  Heart,
  UserCheck,
  Stethoscope,
  Send,
  Clock,
  Eye,
  Bell,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Broadcast, BroadcastAudience, BroadcastPriority } from '@/lib/types';

// Mock data
const mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    title: 'Platform Update - New Features',
    content: "We're excited to announce new features including enhanced pain tracking and community support tools.",
    priority: 'medium',
    audience: 'all',
    recipient_count: 1247,
    read_count: 892,
    sent_at: '2024-11-02T10:00:00Z',
    created_by: 'admin',
  },
  {
    id: '2',
    title: 'Crisis Support Resources',
    content: 'New 24/7 crisis support hotline now available. Call 1-800-SCD-HELP for immediate assistance.',
    priority: 'high',
    audience: 'warriors',
    recipient_count: 1098,
    read_count: 945,
    sent_at: '2024-11-08T14:00:00Z',
    created_by: 'admin',
  },
];

const audienceOptions = [
  { value: 'all', label: 'All Users', icon: Users, count: 1247 },
  { value: 'warriors', label: 'Warriors Only', icon: Heart, count: 856 },
  { value: 'guardians', label: 'Parents/Guardians Only', icon: UserCheck, count: 243 },
  { value: 'caregivers', label: 'Caregivers Only', icon: Stethoscope, count: 148 },
];

const priorityColors: Record<BroadcastPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

function BroadcastCard({ broadcast }: { broadcast: Broadcast }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const readPercentage = Math.round((broadcast.read_count / broadcast.recipient_count) * 100);

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{broadcast.title}</h3>
        <Badge className={priorityColors[broadcast.priority]}>
          {broadcast.priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{broadcast.content}</p>
      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {broadcast.audience === 'all' ? 'All Users' : broadcast.audience}
        </span>
        <span className="flex items-center gap-1">
          <Send className="h-4 w-4" />
          {broadcast.recipient_count.toLocaleString()} recipients
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {broadcast.read_count.toLocaleString()} read ({readPercentage}%)
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Sent {broadcast.sent_at && formatDate(broadcast.sent_at)}
        </span>
      </div>
    </div>
  );
}

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<BroadcastPriority>('medium');
  const [audience, setAudience] = useState<BroadcastAudience>('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedAudience = audienceOptions.find(a => a.value === audience);
  const charCount = content.length;
  const maxChars = 500;

  const handleSend = async () => {
    if (!title || !content) return;
    
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    
    // Reset after showing success
    setTimeout(() => {
      setTitle('');
      setContent('');
      setPriority('medium');
      setAudience('all');
      setSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Broadcast Communications
          </CardTitle>
          <CardDescription>
            Send notifications and messages to all users or targeted groups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Message Title</Label>
              <Input
                id="title"
                placeholder="Enter a clear, descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                placeholder="Write your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={maxChars}
              />
              <p className="text-xs text-muted-foreground text-right">
                {charCount}/{maxChars} characters
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as BroadcastPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedAudience?.count.toLocaleString()} recipients selected</p>
                </div>
              </div>
            </div>

            {/* Audience Selection */}
            <div className="space-y-2">
              <Label>Select Recipients</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAudience(option.value as BroadcastAudience)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      audience === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <option.icon className={`h-5 w-5 ${
                        audience === option.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.count.toLocaleString()} users</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSend}
            disabled={!title || !content || sending || sent}
            className="w-full gap-2"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sent Successfully!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Broadcast
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Message History
          </CardTitle>
          <CardDescription>
            Previously sent and scheduled broadcast messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sent">
            <TabsList>
              <TabsTrigger value="sent">Sent ({mockBroadcasts.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled (0)</TabsTrigger>
            </TabsList>

            <TabsContent value="sent" className="mt-4 space-y-4">
              {mockBroadcasts.map(broadcast => (
                <BroadcastCard key={broadcast.id} broadcast={broadcast} />
              ))}
            </TabsContent>

            <TabsContent value="scheduled" className="mt-4">
              <div className="py-12 text-center text-muted-foreground">
                No scheduled broadcasts.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Push Notification Info */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          <strong>Push Notifications:</strong> Broadcast messages are delivered as push notifications to the mobile app and in-app notification center. High and urgent priority messages generate immediate alerts.
        </AlertDescription>
      </Alert>
    </div>
  );
}
