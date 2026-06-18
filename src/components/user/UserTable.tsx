"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Shield, ShieldCheck, ShieldX, Copy, Check } from 'lucide-react';
import { User } from '@/services/auth/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TypedDataTable, type Column } from '@/components/common';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-danger" />;
      case 'MODERATOR':
        return <ShieldCheck className="w-3 h-3 text-gold" />;
      default:
        return <ShieldX className="w-3 h-3 text-text-tertiary" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-danger';
      case 'MODERATOR':
        return 'text-gold';
      default:
        return 'text-text-secondary';
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      accessor: (user) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{user.name}</p>
          <p className="text-xs text-text-tertiary">{user.email || 'No email'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (user) => (
        <div className="flex items-center gap-1.5">
          {getRoleIcon(user.role)}
          <span className={`font-medium text-xs ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={user.verified}
            onCheckedChange={(checked) => onVerifiedChange(user.id, checked)}
            disabled={isUpdating}
            className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-2 scale-75"
          />
          <span className={`text-xs ${user.verified ? 'text-success' : 'text-text-tertiary'}`}>
            {user.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      ),
    },
    {
      key: 'referrals',
      header: 'Referrals',
      accessor: (user) =>
        user.referralCount > 0 ? (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-brand/10 text-brand">
            {user.referralCount}
          </span>
        ) : (
          <span className="text-text-tertiary text-xs">—</span>
        ),
    },
    {
      key: 'referredBy',
      header: 'Referred By',
      accessor: (user) =>
        user.referredBy ? (
          <span className="text-xs text-text-secondary">{user.referredBy}</span>
        ) : (
          <span className="text-text-tertiary text-xs">—</span>
        ),
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      accessor: (user) =>
        user.referralCode ? (
          <div className="flex items-center gap-1">
            <code className="text-xs text-text-secondary bg-surface-2 px-1.5 py-0.5 rounded">
              {user.referralCode}
            </code>
            <button
              onClick={() => copyReferralCode(user.referralCode!)}
              className="p-1 rounded hover-subtle"
            >
              {copiedCode === user.referralCode ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-text-tertiary text-xs">—</span>
        ),
    },
    {
      key: 'dates',
      header: 'Dates',
      accessor: (user) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-text-tertiary cursor-help border-b border-dotted border-border-default">
                {formatDate(user.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-surface border-border-default">
              <div className="text-xs space-y-1">
                <p><span className="text-text-secondary">Joined:</span> <span className="text-text-primary">{formatDate(user.createdAt)}</span></p>
                <p><span className="text-text-secondary">Updated:</span> <span className="text-text-primary">{formatDate(user.updatedAt)}</span></p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'actions',
      header: <span className="text-right w-full block">Actions</span>,
      align: 'right',
      accessor: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(user)}
            className="text-text-tertiary hover:text-text-primary hover:bg-surface-2 h-7 w-7 p-0"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={user.id === currentUserId}
            onClick={() => onDeleteUser(user.id)}
            className="text-text-tertiary hover:text-danger hover:bg-danger/10 h-7 w-7 p-0 disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TypedDataTable<User>
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      isLoading={isLoading && users.length === 0}
      emptyMessage="No users found"
      emptyDescription="Try adjusting your filters"
    />
  );
}
