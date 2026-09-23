"use client";

import React, { useState, useMemo } from 'react';
import { ProtectedAction, KpiRibbon, DataStatus } from '@/components/common';
import { compactCount } from '@/lib/formatters/numberFormatting';
import { DeleteConfirmDialog } from '@/components/common';
import { useAuthContext } from '@/contexts/auth.context';
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from '@/services/auth/user';
import { AdminUpdateUserInput, AdminUsersQueryParams } from '@/services/auth/user/types';
import { User } from '@/services/auth/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
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

  // A new search or role filter restarts from the first page: the server would
  // otherwise return an empty page past the end of the narrowed result set.
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setPage(0);
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
      <div className="space-y-4">
        {/* Stats ribbon (§7.b) */}
        <KpiRibbon
          columns="grid-cols-2 lg:grid-cols-4"
          cells={[
            { label: "Total users", value: compactCount(pagination?.total || stats.total) },
            { label: "Admins", value: compactCount(stats.admins), tone: "danger" },
            { label: "Moderators", value: compactCount(stats.moderators), tone: "gold" },
            { label: "Verified", value: compactCount(stats.verified), tone: "success" },
          ]}
        />

        {/* Accounts table — owns its card: head (title + freshness), filters toolbar, server pagination */}
        <UserTable
          users={users}
          isLoading={isLoading}
          currentUserId={currentUser?.id}
          isUpdating={isUpdating}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onVerifiedChange={handleVerifiedChange}
          headerAction={
            <DataStatus variant="polled" isRefreshing={isLoading} onRefresh={handleRefresh} />
          }
          toolbar={
            <div className="w-full">
              <UserFilters
                searchTerm={searchTerm}
                selectedRole={selectedRole}
                onSearchChange={handleSearchChange}
                onRoleChange={handleRoleChange}
              />
            </div>
          }
          pagination={
            pagination
              ? {
                  total: pagination.total,
                  page,
                  rowsPerPage,
                  onPageChange: handlePageChange,
                  onRowsPerPageChange: handleRowsPerPageChange,
                }
              : undefined
          }
          paginationDisabled={isLoading}
        />
      </div>

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
    </ProtectedAction>
  );
}