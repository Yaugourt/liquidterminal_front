"use client";

import React, { useState, useMemo } from 'react';
import { ProtectedAction } from '@/components/common/ProtectedAction';
import { Pagination } from '@/components/common/pagination';
import { useAuthContext } from '@/contexts/auth.context';
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from '@/services/auth/user';
import { AdminUpdateUserInput, AdminUsersQueryParams } from '@/services/auth/user/types';
import { User } from '@/services/auth/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Users, Shield, RefreshCw, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserEditModal } from './UserEditModal';

// Stats Card Component
function StatsCard({
  icon: Icon,
  title,
  value,
  iconColor = 'text-[#83e9ff]',
  iconBg = 'bg-[#83e9ff]/10'
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="glass-panel p-4 hover:border-border-hover transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={16} className={iconColor} />
        </div>
        <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <span className="text-xl text-white font-bold tracking-tight">{value}</span>
    </div>
  );
}

export function UserManagement() {
  const { user: currentUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<AdminUpdateUserInput>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Build query parameters for server-side pagination and filtering
  const queryParams: AdminUsersQueryParams = useMemo(() => {
    const params: AdminUsersQueryParams = {
      page: page + 1, // API uses 1-based pagination
      limit: rowsPerPage,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (selectedRole !== 'all') {
      params.role = selectedRole as 'USER' | 'MODERATOR' | 'ADMIN';
    }

    return params;
  }, [page, rowsPerPage, searchTerm, selectedRole]);

  // Get users with server-side pagination and filtering
  const { users, isLoading, error, refetch, pagination } = useAdminUsers(queryParams);
  const { updateUser, isLoading: isUpdating } = useAdminUpdateUser();
  const { deleteUser } = useAdminDeleteUser();

  // Calculate stats
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return { total: 0, admins: 0, moderators: 0, verified: 0 };
    }
    return {
      total: pagination?.total || users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      moderators: users.filter(u => u.role === 'MODERATOR').length,
      verified: users.filter(u => u.verified).length,
    };
  }, [users, pagination]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  // Handle user update
  const handleUpdateUser = async (userId: string, data: AdminUpdateUserInput) => {
    try {
      await updateUser(parseInt(userId), data);
      toast.success('User updated successfully');
      await refetch();
      setEditingUser(null);
      setEditForm({});
    } catch {
      toast.error('Error updating user');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(parseInt(userId));
      toast.success('User deleted successfully');
      await refetch();
    } catch {
      toast.error('Error deleting user');
    }
  };

  // Handle verified status change
  const handleVerifiedChange = async (userId: string, verified: boolean) => {
    await handleUpdateUser(userId, { verified });
  };

  // Handle user editing
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified
    });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editingUser) {
      handleUpdateUser(editingUser.id, editForm);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Data refreshed');
    } catch {
      toast.error('Error refreshing data');
    }
  };

  if (error) {
    return (
      <div className="glass-panel p-6">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center backdrop-blur-md">
          <p className="text-rose-400 mb-3 text-sm">Error loading users</p>
          <Button
            onClick={handleRefresh}
            className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FF]/80 text-sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is loaded
  if (!currentUser) {
    return (
      <div className="glass-panel p-6">
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-text-muted text-sm">Loading user...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedAction
      requiredRole="ADMIN"
      user={currentUser}
      fallback={
        <div className="glass-panel p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Shield className="w-8 h-8 text-[#f9e370] mx-auto mb-3" />
              <p className="text-white text-sm">Access restricted to administrators</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Main Card Container */}
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f9e370]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#f9e370]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">User Management</h1>
              <p className="text-text-secondary text-xs">Administration of user accounts</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="interactive-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="p-4 border-b border-border-subtle">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard
              icon={Users}
              title="Total Users"
              value={pagination?.total || stats.total}
              iconColor="text-[#83e9ff]"
              iconBg="bg-[#83e9ff]/10"
            />
            <StatsCard
              icon={Shield}
              title="Admins"
              value={stats.admins}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10"
            />
            <StatsCard
              icon={ShieldCheck}
              title="Moderators"
              value={stats.moderators}
              iconColor="text-[#f9e370]"
              iconBg="bg-[#f9e370]/10"
            />
            <StatsCard
              icon={UserCheck}
              title="Verified"
              value={stats.verified}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            selectedRole={selectedRole}
            onSearchChange={setSearchTerm}
            onRoleChange={setSelectedRole}
          />

          {/* Table */}
          <UserTable
            users={users}
            isLoading={isLoading}
            currentUserId={currentUser?.id}
            isUpdating={isUpdating}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onVerifiedChange={handleVerifiedChange}
          />

          {/* Edit Modal */}
          <UserEditModal
            user={editingUser}
            editForm={editForm}
            isUpdating={isUpdating}
            onFormChange={setEditForm}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />

          {/* Pagination */}
          {pagination && (
            <Pagination
              total={pagination.total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              disabled={isLoading}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </ProtectedAction>
  );
}