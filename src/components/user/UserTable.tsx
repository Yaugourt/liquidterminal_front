"use client";

import React, { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { User } from '@/services/auth/types';
import { TypedDataTable, ModuleAsset, type Column, type PaginationProps } from '@/components/common';
import { formatDate } from '@/lib/formatters/dateFormatting';
import { useDateFormat } from '@/store/date-format.store';

type UserPagination = Pick<
  PaginationProps,
  'total' | 'page' | 'rowsPerPage' | 'onPageChange' | 'onRowsPerPageChange'
>;

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  currentUserId?: string;
  isUpdating: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onVerifiedChange: (userId: string, verified: boolean) => void;
  /** Right slot of the card head (freshness / refresh). */
  headerAction?: ReactNode;
  /** Search + role filter, under the head. */
  toolbar?: ReactNode;
  /** Server pagination (omit to hide the footer). */
  pagination?: UserPagination;
  /** Greys out the pagination footer while a request is in flight. */
  paginationDisabled?: boolean;
}

const ROLE_VARIANT: Record<User['role'], 'error' | 'gold' | 'neutral'> = {
  ADMIN: 'error',
  MODERATOR: 'gold',
  USER: 'neutral',
};

/** Referral code + copy. Not an address, so no `AddressDisplay` (it always links to the explorer). */
function ReferralCodeCell({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="inline-flex items-center gap-1.5">
      {code}
      <button
        onClick={copy}
        className="group p-0.5 rounded-md hover:bg-surface-2 transition-colors"
        aria-label="Copy referral code"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3 text-text-tertiary group-hover:text-text-primary transition-colors" />
        )}
      </button>
    </div>
  );
}

export function UserTable({
  users,
  isLoading,
  currentUserId,
  isUpdating,
  onEditUser,
  onDeleteUser,
  onVerifiedChange,
  headerAction,
  toolbar,
  pagination,
  paginationDisabled,
}: UserTableProps) {
  const { format: dateFormat } = useDateFormat();
  const date = (d: Date | undefined) => (d ? formatDate(d, dateFormat) : '—');

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      accessor: (user) => (
        <ModuleAsset
          logo={user.name?.slice(0, 2).toUpperCase()}
          name={user.name}
          sub={user.email || 'No email'}
        />
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (user) => (
        <StatusBadge variant={ROLE_VARIANT[user.role] ?? 'neutral'}>{user.role}</StatusBadge>
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
          <StatusBadge variant={user.verified ? 'success' : 'inactive'}>
            {user.verified ? 'Verified' : 'Unverified'}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: 'referrals',
      header: 'Referrals',
      type: 'numeric',
      tone: (user) => (user.referralCount > 0 ? 'brand' : 'muted'),
      accessor: (user) => (user.referralCount > 0 ? user.referralCount : '—'),
    },
    {
      key: 'referredBy',
      header: 'Referred By',
      accessor: (user) => user.referredBy || '—',
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      accessor: (user) =>
        user.referralCode ? <ReferralCodeCell code={user.referralCode} /> : '—',
    },
    {
      key: 'joined',
      header: 'Joined',
      type: 'time',
      accessor: (user) => date(user.createdAt),
    },
    {
      key: 'updated',
      header: 'Updated',
      type: 'time',
      className: 'max-xl:hidden',
      accessor: (user) => date(user.updatedAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(user)}
            className="text-text-tertiary hover:text-text-primary hover:bg-surface-2 h-7 w-7 p-0"
            aria-label="Edit user"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={user.id === currentUserId}
            onClick={() => onDeleteUser(user.id)}
            className="text-text-tertiary hover:text-danger hover:bg-danger/10 h-7 w-7 p-0 disabled:opacity-30"
            aria-label="Delete user"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TypedDataTable<User>
      title="Accounts"
      tag="admin"
      headerAction={headerAction}
      toolbar={toolbar}
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      isLoading={isLoading && users.length === 0}
      emptyMessage="No users found"
      emptyDescription="Try adjusting your filters"
      {...pagination}
      rowsPerPageOptions={[10, 25, 50, 100]}
      paginationDisabled={paginationDisabled}
    />
  );
}
