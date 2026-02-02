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
  RefreshCw,
  Clock,
  Loader2,
  Trash2,
} from 'lucide-react';
import { StreakableItem } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { streakableApi } from '@/lib/api/admin';

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  frequency_per_day: z.number().min(1, 'Must be at least 1'),
  interval_days: z.number().min(1, 'Must be at least 1'),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

function ItemCard({ item, onDelete }: { item: StreakableItem & { adoption_count?: number }; onDelete: (id: string) => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>{item.frequency_per_day}x/day</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Every {item.interval_days} day{item.interval_days > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{item.adoption_count?.toLocaleString() || 0} users</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Created {formatDate(item.created_at)}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StreakableItemsPage() {
  const [items, setItems] = useState<(StreakableItem & { adoption_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      frequency_per_day: 1,
      interval_days: 1,
    },
  });

  useEffect(() => {
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

    fetchItems();
  }, []);

  const onCreateItem = async (data: CreateItemFormData) => {
    setCreating(true);
    try {
      const newItem = await streakableApi.createItem(data);
      setItems((prev) => [newItem, ...prev]);
      setShowCreateDialog(false);
      reset();
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setCreating(false);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const performDelete = () => {
    if (itemToDelete) {
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
  }

  const stats = {
    total: items?.length || 0,
    totalUsers: items?.reduce((sum, item) => sum + (item.adoption_count || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Streakable Items
              </CardTitle>
              <CardDescription>
                Create and manage habit tracking items for users
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-700">{stats.total}</p>
              <p className="text-sm text-orange-600">Active Items</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Total Adopters</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : !items?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No streakable items yet.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Streakable Item</DialogTitle>
            <DialogDescription>
              Add a new habit tracking item for users to build streaks with.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateItem)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Daily Pain Log" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the habit..."
                {...register('description')} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency_per_day">Frequency per Day</Label>
                <Input 
                  id="frequency_per_day" 
                  type="number" 
                  min={1}
                  {...register('frequency_per_day', { valueAsNumber: true })} 
                />
                {errors.frequency_per_day && (
                  <p className="text-sm text-destructive">{errors.frequency_per_day.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval_days">Interval (Days)</Label>
                <Input 
                  id="interval_days" 
                  type="number" 
                  min={1}
                  {...register('interval_days', { valueAsNumber: true })} 
                />
                {errors.interval_days && (
                  <p className="text-sm text-destructive">{errors.interval_days.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this streakable item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
