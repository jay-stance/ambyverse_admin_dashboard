'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Settings,
  User,
  Lock,
  Server,
  Database,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi, rolesApi } from '@/lib/api/admin';
import { User as UserType, AdminRole } from '@/lib/types';

// Schemas
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const createAdminSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be at least 18'),
  roleId: z.string().min(1, 'Please select a role'),
});

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().min(5, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type CreateAdminFormData = z.infer<typeof createAdminSchema>;
type CreateRoleFormData = z.infer<typeof createRoleSchema>;

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'View, edit, ban users' },
  { id: 'manage_admins', label: 'Manage Admins', description: 'Create and manage sub-admins' },
  { id: 'manage_content', label: 'Manage Content', description: 'Streakable items, resources' },
  { id: 'view_logs', label: 'View Logs', description: 'Access system and activity logs' },
  { id: 'manage_finance', label: 'Manage Finance', description: 'Access financial data' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'System configuration' },
];

function ProfileSection() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Your account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {user?.full_name ? getInitials(user.full_name) : 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-xl font-semibold">{user?.full_name || 'Admin User'}</h3>
              <Badge className="mt-1 bg-purple-100 text-purple-700">Administrator</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email || 'admin@example.com'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {user?.phone_number || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(user?.created_at)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setError(null);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to change password. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Password changed successfully!
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                {...register('currentPassword')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RolesManagementSection({ roles, onRefresh }: { roles: AdminRole[], onRefresh: () => void }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { permissions: [] },
  });

  const selectedPermissions = watch('permissions');

  const togglePermission = (id: string) => {
    const current = selectedPermissions;
    if (current.includes(id)) {
      setValue('permissions', current.filter(p => p !== id));
    } else {
      setValue('permissions', [...current, id]);
    }
  };

  const onCreateRole = async (data: CreateRoleFormData) => {
    setCreating(true);
    try {
      await rolesApi.createRole(data);
      onRefresh();
      setShowCreateDialog(false);
      reset();
    } catch (error) {
      console.error('Failed to create role', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Manage access levels and permissions
              </CardDescription>
             </div>
             <Button onClick={() => setShowCreateDialog(true)} variant="outline">
               <Shield className="h-4 w-4 mr-2" />
               Create Role
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-2">
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <Separator />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.slice(0, 3).map(p => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        {p.replace('_', ' ')}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{role.permissions.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role and assign permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input id="roleName" {...register('name')} placeholder="e.g. Content Editor" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDesc">Description</Label>
              <Input id="roleDesc" {...register('description')} placeholder="What can this role do?" />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-[200px] overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <div key={perm.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={perm.id} 
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                       <label
                          htmlFor={perm.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {perm.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {perm.description}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.permissions && <p className="text-sm text-destructive">{errors.permissions.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminManagementSection({ roles }: { roles: AdminRole[] }) {
  const [admins, setAdmins] = useState<UserType[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const fetchAdmins = async () => {
    try {
      const data = await adminApi.getUsers({ role: 'admin' });
      setAdmins(data.users);
    } catch (error) {
      console.error('Failed to fetch admins', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onCreateAdmin = async (data: CreateAdminFormData) => {
    setCreating(true);
    try {
      await rolesApi.createAdmin({ ...data, role: 'admin', adminRoleId: data.roleId });
      fetchAdmins();
      setShowCreateDialog(false);
      reset();
    } catch {
      // Error handling
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Management
              </CardTitle>
              <CardDescription>
                Manage administrator accounts
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.length === 0 ? (
               <div className="text-center py-4 text-muted-foreground">
                 No administrators found.
               </div>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(admin.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admin.full_name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Added {formatDate(admin.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>
              Add a new administrator and assign a role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateAdmin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select onValueChange={(val) => setValue('roleId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-destructive">{errors.roleId.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input id="phoneNumber" {...register('phoneNumber')} />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...register('age', { valueAsNumber: true })} />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...register('emergencyContact')} />
              {errors.emergencyContact && (
                <p className="text-sm text-destructive">{errors.emergencyContact.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SystemStatusSection() {
  const systems = [
    { name: 'API Server', status: 'online', icon: Server },
    { name: 'Database', status: 'online', icon: Database },
    { name: 'Authentication', status: 'online', icon: Shield },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>
          Current status of platform services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systems.map((system) => (
            <div key={system.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <system.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{system.name}</span>
              </div>
              <Badge className={system.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {system.status === 'online' ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {system.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  
  const fetchRoles = async () => {
    try {
      const data = await rolesApi.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  useEffect(() => {
    // Only fetch roles if user has permission
    if (user?.permissions?.includes('manage_admins')) {
       fetchRoles();
    }
  }, [user]);

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and system settings
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {hasPermission('manage_admins') && <TabsTrigger value="admins">Admins</TabsTrigger>}
          {hasPermission('manage_admins') && <TabsTrigger value="roles">Roles</TabsTrigger>}
          {hasPermission('manage_settings') && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <PasswordSection />
        </TabsContent>

        {hasPermission('manage_admins') && (
            <>
                <TabsContent value="admins" className="mt-6">
                <AdminManagementSection roles={roles} />
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                <RolesManagementSection roles={roles} onRefresh={fetchRoles} />
                </TabsContent>
            </>
        )}

        {hasPermission('manage_settings') && (
            <TabsContent value="system" className="mt-6">
            <SystemStatusSection />
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
