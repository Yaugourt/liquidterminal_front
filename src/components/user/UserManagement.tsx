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
import { Users, Shield, RefreshCw } from 'lucide-react';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserEditModal } from './UserEditModal';

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
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-red-400 mb-3 text-sm font-inter">Error loading users</p>
          <Button onClick={handleRefresh} className="bg-brand-accent text-brand-tertiary hover:bg-brand-accent/80 font-inter text-sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is loaded
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Shield className="w-8 h-8 text-brand-gold mx-auto mb-3" />
          <p className="text-white font-inter text-sm">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedAction
      requiredRole="ADMIN"
      user={currentUser}
      fallback={
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Shield className="w-8 h-8 text-brand-gold mx-auto mb-3" />
            <p className="text-white font-inter text-sm">Access restricted to administrators</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-gold/10 rounded-lg">
              <Users className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-inter">User Management</h1>
              <p className="text-secondary text-xs font-inter">Administration of user accounts</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-brand-gold text-brand-tertiary hover:bg-brand-gold/80 font-inter text-sm"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

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
    </ProtectedAction>
  );
} 