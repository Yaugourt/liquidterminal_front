"use client";

import React, { useState, useMemo } from 'react';
import { ProtectedAction } from '@/components/common/ProtectedAction';
import { useAuth } from '@/services/auth/hooks/use-auth';
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from '@/services/auth/user';
import { AdminUpdateUserInput } from '@/services/auth/user/types';
import { User } from '@/services/auth/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Users, Shield, RefreshCw } from 'lucide-react';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserEditModal } from './UserEditModal';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<AdminUpdateUserInput>({});

  // Get all users without filters
  const { users: allUsers, isLoading, error, refetch, pagination } = useAdminUsers() as {
    users: User[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  const { updateUser, isLoading: isUpdating } = useAdminUpdateUser();
  const { deleteUser } = useAdminDeleteUser();

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    let filtered = allUsers;
    
    // Filter by search
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((user: User) => 
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    }
    
    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter((user: User) => user.role === selectedRole);
    }
    
    return filtered;
  }, [allUsers, searchTerm, selectedRole]);

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
          <Button onClick={handleRefresh} className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FFCC] font-inter text-sm">
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
          <Shield className="w-8 h-8 text-[#f9e370] mx-auto mb-3" />
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
            <Shield className="w-8 h-8 text-[#f9e370] mx-auto mb-3" />
            <p className="text-white font-inter text-sm">Access restricted to administrators</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#f9e3701A] rounded-lg">
              <Users className="w-4 h-4 text-[#f9e370]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-inter">User Management</h1>
              <p className="text-[#FFFFFF80] text-xs font-inter">Administration of user accounts</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-[#f9e370] text-[#051728] hover:bg-[#f9e370CC] font-inter text-sm"
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
          users={filteredUsers}
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#FFFFFF80] font-inter">
              {filteredUsers.length} user(s) displayed out of {pagination.total} total
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={handleRefresh}
                className="border-[#83E9FF4D] text-[#83E9FF] hover:bg-[#83E9FF1A] font-inter text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-white font-inter">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={handleRefresh}
                className="border-[#83E9FF4D] text-[#83E9FF] hover:bg-[#83E9FF1A] font-inter text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedAction>
  );
} 