"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Users, Edit, Trash2, Shield, ShieldCheck, ShieldX, Loader2, Copy, Check } from 'lucide-react';
import { User } from '@/services/auth/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  // Function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-rose-400" />;
      case 'MODERATOR':
        return <ShieldCheck className="w-3 h-3 text-[#f9e370]" />;
      default:
        return <ShieldX className="w-3 h-3 text-zinc-500" />;
    }
  };

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-rose-400';
      case 'MODERATOR':
        return 'text-[#f9e370]';
      default:
        return 'text-zinc-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
          <span className="text-zinc-500 text-sm">Loading users...</span>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <Users className="w-10 h-10 mb-3 text-zinc-600" />
        <p className="text-zinc-400 text-sm mb-1">No users found</p>
        <p className="text-zinc-600 text-xs">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <table className="table-fixed w-full">
        <thead>
          <tr className="border-b border-white/5 hover:bg-transparent">
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">User</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Role</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Status</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Referrals</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Referred By</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Referral Code</span>
            </th>
            <th className="text-left py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Dates</span>
            </th>
            <th className="text-right py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              {/* User Info */}
              <td className="py-3 px-3">
                <div>
                  <p className="font-medium text-white text-sm">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email || 'No email'}</p>
                </div>
              </td>

              {/* Role */}
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  {getRoleIcon(user.role)}
                  <span className={`font-medium text-xs ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.verified}
                    onCheckedChange={(checked) => onVerifiedChange(user.id, checked)}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-[#83E9FF] data-[state=unchecked]:bg-zinc-700 scale-75"
                  />
                  <span className={`text-xs ${user.verified ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </td>

              {/* Referrals Count */}
              <td className="py-3 px-3">
                {user.referralCount > 0 ? (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#83e9ff]/10 text-[#83e9ff]">
                    {user.referralCount}
                  </span>
                ) : (
                  <span className="text-zinc-600 text-xs">—</span>
                )}
              </td>

              {/* Referred By */}
              <td className="py-3 px-3">
                {user.referredBy ? (
                  <span className="text-xs text-zinc-300">{user.referredBy}</span>
                ) : (
                  <span className="text-zinc-600 text-xs">—</span>
                )}
              </td>

              {/* Referral Code */}
              <td className="py-3 px-3">
                {user.referralCode ? (
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                      {user.referralCode}
                    </code>
                    <button
                      onClick={() => copyReferralCode(user.referralCode!)}
                      className="p-1 rounded hover:bg-white/5 transition-colors"
                    >
                      {copiedCode === user.referralCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">—</span>
                )}
              </td>

              {/* Dates with Tooltip */}
              <td className="py-3 px-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-zinc-500 cursor-help border-b border-dotted border-zinc-600">
                        {formatDate(user.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#151A25] border-white/10">
                      <div className="text-xs space-y-1">
                        <p><span className="text-zinc-400">Joined:</span> <span className="text-white">{formatDate(user.createdAt)}</span></p>
                        <p><span className="text-zinc-400">Updated:</span> <span className="text-white">{formatDate(user.updatedAt)}</span></p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>

              {/* Actions */}
              <td className="py-3 px-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    className="text-zinc-500 hover:text-white hover:bg-white/5 h-7 w-7 p-0"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={user.id === currentUserId}
                    onClick={() => onDeleteUser(user.id)}
                    className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 h-7 w-7 p-0 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}