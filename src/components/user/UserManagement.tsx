"use client";

import React, { useState, useMemo } from 'react';
import { ProtectedAction, KpiRibbon, DataStatus } from '@/components/common';
import { compactCount } from '@/lib/formatters/numberFormatting';
import { Pagination, DeleteConfirmDialog } from '@/components/common';
import { useAuthContext } from '@/contexts/auth.context';
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from '@/services/auth/user';
import { AdminUpdateUserInput, AdminUsersQueryParams } from '@/services/auth/user/types';
import { User } from '@/services/auth/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Users, Shield } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserEditModal } from './UserEditModal';
import { Card } from "@/components/ui/card";

export function UserManagement() {
  const { user: currentUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<AdminUpdateUserInput>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
  const { deleteUser, isLoading: isDeleting } = useAdminDeleteUser();

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

  // Handle user deletion — open the confirmation dialog
  const handleDeleteUser = (userId: string) => {
    const target = users?.find(u => u.id === userId) ?? null;
    if (!target) return;
    setUserToDelete(target);
  };

  // Confirm user deletion — runs the actual delete after confirmation
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(parseInt(userToDelete.id));
      toast.success('User deleted successfully');
      await refetch();
      setUserToDelete(null);
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
      <Card className="p-6">
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 text-center">
          <p className="text-danger mb-3 text-sm">Error loading users</p>
          <Button
            onClick={handleRefresh}
            className="bg-brand text-brand-text-on hover:bg-brand/80 text-sm"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Check if user is loaded
  if (!currentUser) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-[200px]">
          <LoadingState message="Loading user..." size="sm" withCard={false} />
        </div>
      </Card>
    );
  }

  return (
    <ProtectedAction
      requiredRole="ADMIN"
      user={currentUser}
      fallback={
        <Card className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Shield className="w-8 h-8 text-gold mx-auto mb-3" />
              <p className="text-text-primary text-sm">Access restricted to administrators</p>
            </div>
          </div>
        </Card>
      }
    >
      {/* Main Card Container */}
      <Card>
        {/* V4 card-head: icon + title + tag + freshness/refresh in the ml-auto corner */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Users size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Accounts</h3>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            admin
          </span>
          <DataStatus
            variant="polled"
            className="ml-auto"
            isRefreshing={isLoading}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Stats ribbon (§7.b) — embedded, so no outer border */}
        <div className="border-b border-border-subtle">
          <KpiRibbon
            bordered={false}
            columns="grid-cols-2 lg:grid-cols-4"
            cells={[
              { label: "Total users", value: compactCount(pagination?.total || stats.total) },
              { label: "Admins", value: compactCount(stats.admins), tone: "danger" },
              { label: "Moderators", value: compactCount(stats.moderators), tone: "gold" },
              { label: "Verified", value: compactCount(stats.verified), tone: "success" },
            ]}
          />
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

          {/* Delete Confirmation */}
          <DeleteConfirmDialog
            open={userToDelete !== null}
            onOpenChange={(open) => {
              if (!open) setUserToDelete(null);
            }}
            title="Delete User"
            description={
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold">{userToDelete?.name || userToDelete?.email || 'this user'}</span>?
              </>
            }
            isLoading={isDeleting}
            onConfirm={confirmDeleteUser}
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
      </Card>
    </ProtectedAction>
  );
}