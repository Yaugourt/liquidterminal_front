"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Users, Edit, Trash2, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { User } from '@/services/auth/types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  currentUserId?: string;
  isUpdating: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onVerifiedChange: (userId: string, verified: boolean) => void;
}

export function UserTable({
  users,
  isLoading,
  currentUserId,
  isUpdating,
  onEditUser,
  onDeleteUser,
  onVerifiedChange
}: UserTableProps) {
  // Function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-red-400" />;
      case 'MODERATOR':
        return <ShieldCheck className="w-3 h-3 text-yellow-400" />;
      default:
        return <ShieldX className="w-3 h-3 text-gray-400" />;
    }
  };

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-400';
      case 'MODERATOR':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#151A25]/90 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20">
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-gold mx-auto mb-3"></div>
              <p className="text-zinc-500 font-inter text-sm">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card className="bg-[#151A25]/90 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20">
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Users className="w-8 h-8 text-brand-gold mx-auto mb-3 opacity-50" />
              <p className="text-zinc-500 font-inter text-sm">No users found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#151A25]/90 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20">
      <CardHeader className="border-b border-white/5 pb-3">
        <CardTitle className="text-white flex items-center space-x-2 font-inter text-base">
          <Users className="w-4 h-4 text-brand-gold" />
          <span>Users ({users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-zinc-400 font-semibold uppercase tracking-wider font-inter text-[10px]">User</th>
                <th className="text-left p-3 text-zinc-400 font-semibold uppercase tracking-wider font-inter text-[10px]">Role</th>
                <th className="text-left p-3 text-zinc-400 font-semibold uppercase tracking-wider font-inter text-[10px]">Status</th>
                <th className="text-left p-3 text-zinc-400 font-semibold uppercase tracking-wider font-inter text-[10px]">Date</th>
                <th className="text-right p-3 text-zinc-400 font-semibold uppercase tracking-wider font-inter text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-white font-inter text-sm">{user.name}</p>
                      <p className="text-xs text-zinc-500 font-inter">{user.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5">
                      {getRoleIcon(user.role)}
                      <span className={`font-medium ${getRoleColor(user.role)} font-inter text-xs`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.verified}
                        onCheckedChange={(checked) => onVerifiedChange(user.id, checked)}
                        disabled={isUpdating}
                        className="data-[state=checked]:bg-brand-accent data-[state=unchecked]:bg-zinc-700 scale-75"
                      />
                      <span className={`text-xs ${user.verified ? 'text-green-400' : 'text-red-400'} font-inter`}>
                        {user.verified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-zinc-500 font-inter">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        className="text-zinc-400 hover:text-white hover:bg-white/5 font-inter h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUserId}
                        onClick={() => onDeleteUser(user.id)}
                        className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 font-inter h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 