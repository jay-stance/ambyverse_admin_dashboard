'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Flame,
  Plus,
  Calendar,
  Users,
  Loader2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Droplets,
  Siren,
  Target,
} from 'lucide-react';
import { StreakableItem, TrackingStyle } from '@/lib/types';
import { streakableApi } from '@/lib/api/admin';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateSlots(freq: number): string[] {
  if (freq === 2) return ['Morning', 'Night'];
  if (freq === 3) return ['Morning', 'Afternoon', 'Night'];
  if (freq === 4) return ['Morning', 'Midday', 'Afternoon', 'Night'];
  return Array.from({ length: freq }, (_, i) => `Dose ${i + 1}`);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Style config ──────────────────────────────────────────────────────────────

const STYLE_CONFIG: Record<TrackingStyle, {
  label: string;
  emoji: string;
  desc: string;
  badgeBg: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
}> = {
  once: {
    label: 'Once Daily',
    emoji: '✓',
    desc: 'One tap to log for the day',
    badgeBg: '#DDF3E4',
    badgeColor: '#16a34a',
    iconBg: '#DDF3E4',
    iconColor: '#16a34a',
  },
  scheduled: {
    label: 'Scheduled',
    emoji: '🔁',
    desc: 'Set how many — shows as slots',
    badgeBg: '#FCEEDF',
    badgeColor: '#F08A3C',
    iconBg: '#FCEEDF',
    iconColor: '#F08A3C',
  },
  fill: {
    label: 'Fill a Goal',
    emoji: '💧',
    desc: 'A ring they fill (like water)',
    badgeBg: '#E5EDFF',
    badgeColor: '#2563EB',
    iconBg: '#E5EDFF',
    iconColor: '#2563EB',
  },
  prn: {
    label: 'As Needed',
    emoji: '🚨',
    desc: 'Rescue — counts, no streak break',
    badgeBg: '#FCE2E2',
    badgeColor: '#c2455a',
    iconBg: '#FCE2E2',
    iconColor: '#c2455a',
  },
};

// ─── Item Card ─────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  onDelete,
}: {
  item: StreakableItem & { adoption_count?: number };
  onDelete: (id: string) => void;
}) {
  const style = item.tracking_style ?? 'once';
  const cfg = STYLE_CONFIG[style];

  const metaItems: { icon: string; text: string }[] = [];
  if (style === 'once') {
    metaItems.push({ icon: '✓', text: '1 tap' });
    metaItems.push({ icon: '🕐', text: 'Daily' });
  } else if (style === 'scheduled') {
    const slotNames = Array.isArray(item.slots) && item.slots.length > 0
      ? item.slots.join(' & ')
      : `${item.frequency_per_day}×/day`;
    metaItems.push({ icon: '🔁', text: slotNames });
    metaItems.push({ icon: '🕐', text: `Every ${item.interval_days} day${item.interval_days > 1 ? 's' : ''}` });
  } else if (style === 'fill') {
    metaItems.push({ icon: '🎯', text: `Target ${item.target_count ?? '?'}` });
    metaItems.push({ icon: '📏', text: item.unit_label ?? 'units' });
    metaItems.push({ icon: '🕐', text: 'Daily' });
  } else if (style === 'prn') {
    metaItems.push({ icon: '🚨', text: 'No schedule' });
    metaItems.push({ icon: '📈', text: 'Logs frequency' });
  }
  if ((item.adoption_count ?? 0) > 0) {
    metaItems.push({ icon: '👥', text: `${item.adoption_count} users` });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: cfg.iconBg, color: cfg.iconColor }}
        >
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base truncate">{item.title}</p>
          <span
            className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-md inline-block mt-1"
            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
          >
            {cfg.label.toUpperCase()}
            {style === 'scheduled' && item.frequency_per_day > 1 ? ` · ${item.frequency_per_day}×/day` : ''}
            {style === 'fill' && item.target_count ? ` · ${item.target_count}/${item.unit_label ?? 'units'} day` : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-gray-500 mb-3">{item.description}</p>
      )}

      {/* Meta row */}
      <div className="flex gap-4 flex-wrap text-xs text-gray-500">
        {metaItems.map((m, i) => (
          <span key={i} className="flex items-center gap-1">
            <span>{m.icon}</span> {m.text}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Created {formatDate(item.created_at)}
        </span>
      </div>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-5 border rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Style tile ────────────────────────────────────────────────────────────────

function StyleTile({
  style,
  selected,
  onSelect,
}: {
  style: TrackingStyle;
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = STYLE_CONFIG[style];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`border-2 rounded-xl p-3 text-left transition-all cursor-pointer ${
        selected
          ? 'border-violet-500 bg-violet-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="text-2xl mb-1.5">{cfg.emoji}</div>
      <div className="text-sm font-bold text-gray-900">{cfg.label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{cfg.desc}</div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StreakableItemsPage() {
  const [items, setItems] = useState<(StreakableItem & { adoption_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<TrackingStyle>('once');
  const [scheduledFreq, setScheduledFreq] = useState(2);
  const [fillTarget, setFillTarget] = useState(8);
  const [fillUnit, setFillUnit] = useState('glasses');
  const [intervalDays, setIntervalDays] = useState(1);

  // Computed preview for scheduled slots
  const scheduledSlots = generateSlots(scheduledFreq);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await streakableApi.getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedStyle('once');
    setScheduledFreq(2);
    setFillTarget(8);
    setFillUnit('glasses');
    setIntervalDays(1);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const payload: Parameters<typeof streakableApi.createItem>[0] = {
        title: title.trim(),
        description: description.trim() || undefined,
        tracking_style: selectedStyle,
        interval_days: intervalDays,
      };

      if (selectedStyle === 'scheduled') {
        payload.frequency_per_day = scheduledFreq;
        payload.slots = scheduledSlots;
      } else if (selectedStyle === 'fill') {
        payload.target_count = fillTarget;
        payload.unit_label = fillUnit;
      } else if (selectedStyle === 'once' || selectedStyle === 'prn') {
        payload.frequency_per_day = 1;
      }

      const newItem = await streakableApi.createItem(payload);
      setItems((prev) => [newItem, ...prev]);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setCreating(false);
    }
  };

  const performDelete = async () => {
    if (!itemToDelete) return;
    try {
      await streakableApi.deleteItem(itemToDelete);
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setItemToDelete(null);
    }
  };

  const stats = {
    total: items.length,
    totalUsers: items.reduce((sum, item) => sum + (item.adoption_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Streakable Items
              </CardTitle>
              <CardDescription>Create and manage habit tracking items for users</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-orange-700">{stats.total}</p>
              <p className="text-sm text-orange-600">Active Items</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Total Adopters</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : !items.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No streakable items yet.</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Your First Item</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={setItemToDelete} />
          ))}
        </div>
      )}

      {/* ── Create Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Streakable Item</DialogTitle>
            <DialogDescription>
              Add a habit for users to build streaks with. The style decides how it looks in their app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="s-title">Title</Label>
              <Input
                id="s-title"
                placeholder="e.g., Folic Acid"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="s-desc">Description</Label>
              <Textarea
                id="s-desc"
                placeholder="Describe the habit…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Tracking style picker */}
            <div className="space-y-2">
              <Label>Tracking style</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(STYLE_CONFIG) as TrackingStyle[]).map((s) => (
                  <StyleTile
                    key={s}
                    style={s}
                    selected={selectedStyle === s}
                    onSelect={() => setSelectedStyle(s)}
                  />
                ))}
              </div>
            </div>

            {/* Style-specific fields */}
            {selectedStyle === 'once' && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="inline h-4 w-4 mr-1.5 mb-0.5" />
                Preview: a single "Today's dose" tile users tap once.
              </div>
            )}

            {selectedStyle === 'scheduled' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="s-freq">How many times a day?</Label>
                  <Input
                    id="s-freq"
                    type="number"
                    min={2}
                    max={6}
                    value={scheduledFreq}
                    onChange={(e) => setScheduledFreq(Math.max(2, Math.min(6, Number(e.target.value))))}
                  />
                </div>
                <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-700">
                  <RefreshCw className="inline h-4 w-4 mr-1.5 mb-0.5" />
                  <strong>Slots: </strong>{scheduledSlots.join(' · ')}
                  <span className="block mt-1 text-xs text-violet-500">
                    Each slot logged independently — all must be tapped for the day to count.
                  </span>
                </div>
              </div>
            )}

            {selectedStyle === 'fill' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-target">Daily target</Label>
                    <Input
                      id="s-target"
                      type="number"
                      min={1}
                      value={fillTarget}
                      onChange={(e) => setFillTarget(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-unit">Unit label</Label>
                    <Input
                      id="s-unit"
                      placeholder="glasses"
                      value={fillUnit}
                      onChange={(e) => setFillUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                  <Droplets className="inline h-4 w-4 mr-1.5 mb-0.5" />
                  Preview: a circle that fills with each tap up to {fillTarget} {fillUnit || 'units'} — no measuring needed.
                </div>
              </div>
            )}

            {selectedStyle === 'prn' && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                <Siren className="inline h-4 w-4 mr-1.5 mb-0.5" />
                No schedule. Users log each time they take it; it <strong>records how often</strong> for their doctor and <strong>won't break their streak</strong>. Best for emergency / rescue use.
              </div>
            )}

            {/* Repeats */}
            <div className="space-y-1.5">
              <Label htmlFor="s-interval">Repeats</Label>
              <select
                id="s-interval"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-violet-500 focus:bg-white"
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
              >
                <option value={1}>Every day</option>
                <option value={2}>Every 2 days</option>
                <option value={3}>Every 3 days</option>
                <option value={7}>Weekly</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreateDialog(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !title.trim()}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this streakable item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={performDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
