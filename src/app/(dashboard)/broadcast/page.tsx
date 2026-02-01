'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
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
  Mail,
  Smartphone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Broadcast, BroadcastAudience, BroadcastPriority } from '@/lib/types';
import { broadcastApi, NotificationChannel, RecipientCounts } from '@/lib/api/admin';

const audienceOptions = [
  { value: 'all', label: 'All Users', icon: Users },
  { value: 'warriors', label: 'Warriors Only', icon: Heart },
  { value: 'guardians', label: 'Parents/Guardians Only', icon: UserCheck },
  { value: 'caregivers', label: 'Caregivers Only', icon: Stethoscope },
];

const priorityColors: Record<BroadcastPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const channelOptions: { value: NotificationChannel; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'push', label: 'Push Notification', icon: Bell, description: 'Mobile app notifications' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email to registered addresses' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message (charges apply)' },
];

function BroadcastCard({ broadcast }: { broadcast: any }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const readPercentage = broadcast.recipient_count > 0 
    ? Math.round((broadcast.read_count / broadcast.recipient_count) * 100)
    : 0;

  const channels = broadcast.channels || ['push'];

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{broadcast.title}</h3>
        <Badge className={priorityColors[broadcast.priority as BroadcastPriority] || priorityColors.medium}>
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
          {broadcast.recipient_count?.toLocaleString() || 0} recipients
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {broadcast.read_count?.toLocaleString() || 0} read ({readPercentage}%)
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Sent {broadcast.sent_at && formatDate(broadcast.sent_at)}
        </span>
        <span className="flex items-center gap-1">
          {channels.includes('email') && <Mail className="h-4 w-4" />}
          {channels.includes('push') && <Bell className="h-4 w-4" />}
          {channels.includes('sms') && <MessageSquare className="h-4 w-4" />}
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
  const [channels, setChannels] = useState<NotificationChannel[]>(['push']);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientCounts, setRecipientCounts] = useState<RecipientCounts>({
    all: 0, warriors: 0, guardians: 0, caregivers: 0
  });

  const charCount = content.length;
  const maxChars = 500;

  useEffect(() => {
    fetchBroadcasts();
    fetchRecipientCounts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const data = await broadcastApi.getBroadcasts();
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipientCounts = async () => {
    try {
      const counts = await broadcastApi.getRecipientCounts();
      setRecipientCounts(counts);
    } catch (err) {
      console.error('Failed to fetch recipient counts:', err);
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSend = async () => {
    if (!title || !content || channels.length === 0) {
      setError('Please fill in all fields and select at least one channel');
      return;
    }
    
    setSending(true);
    setSuccess(null);
    setError(null);

    try {
      const result = await broadcastApi.sendBroadcast({
        title,
        content,
        audience,
        channels,
        priority,
      });

      setSuccess(`Broadcast sent to ${result.recipientCount} recipients! (Email: ${result.results.email}, Push: ${result.results.push}, SMS: ${result.results.sms})`);
      
      // Reset form
      setTitle('');
      setContent('');
      setPriority('medium');
      setAudience('all');
      setChannels(['push']);
      
      // Refresh broadcasts list
      fetchBroadcasts();
    } catch (err: any) {
      setError(err.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const selectedCount = recipientCounts[audience as keyof RecipientCounts] || 0;

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
          {/* Success/Error Messages */}
          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

            {/* Notification Channels */}
            <div className="space-y-3">
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-4">
                {channelOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      channels.includes(option.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleChannel(option.value)}
                  >
                    <Checkbox
                      checked={channels.includes(option.value)}
                      onCheckedChange={() => toggleChannel(option.value)}
                    />
                    <option.icon className={`h-5 w-5 ${channels.includes(option.value) ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {channels.includes('sms') && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  SMS charges will apply per recipient
                </p>
              )}
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
                  <p className="font-medium">{selectedCount.toLocaleString()} recipients selected</p>
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
                        <p className="text-sm text-muted-foreground">
                          {recipientCounts[option.value as keyof RecipientCounts]?.toLocaleString() || 0} users
                        </p>
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
            disabled={!title || !content || channels.length === 0 || sending}
            className="w-full gap-2"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
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
            Previously sent broadcast messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading broadcasts...
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No broadcasts sent yet.
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts.map(broadcast => (
                <BroadcastCard key={broadcast.id} broadcast={broadcast} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Info */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          <strong>Notification Channels:</strong> Push notifications are delivered to mobile apps. Emails are sent to registered email addresses. SMS messages are sent to phone numbers (charges apply per message).
        </AlertDescription>
      </Alert>
    </div>
  );
}
