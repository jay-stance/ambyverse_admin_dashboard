'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  BarChart3,
  Megaphone,
  FileText,
  Link2,
  ClipboardList,
  Activity,
  Flame,
  History,
  Settings,
  Shield,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Verify', href: '/verify', icon: BadgeCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const management = [
  { name: 'Connections', href: '/connections', icon: Link2 },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Pain Logs', href: '/pain-logs', icon: Activity },
  { name: 'Streakable Items', href: '/streakable-items', icon: Flame },
  { name: 'Activity Logs', href: '/activity-logs', icon: History },
];

const system = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    
    return (
      <Link
        href={item.href}
        onClick={() => onClose()}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        <item.icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">Admin Dashboard</h1>
          <p className="text-xs text-sidebar-foreground/60">Sickle Cell Platform</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Main
          </p>
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        {/* Management */}
        <div className="mt-6 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Management
          </p>
          {management.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        {/* System */}
        <div className="mt-6 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            System
          </p>
          {system.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>
      </ScrollArea>

      {/* Version */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">Version 1.0.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-4 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
        </Button>
        {sidebarContent}
      </aside>
    </>
  );
}
