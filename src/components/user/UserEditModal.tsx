"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { User } from '@/services/auth/types';
import { AdminUpdateUserInput } from '@/services/auth/user/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';

interface UserEditModalProps {
  user: User | null;
  editForm: AdminUpdateUserInput;
  isUpdating: boolean;
  onFormChange: (form: AdminUpdateUserInput) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function UserEditModal({
  user,
  editForm,
  isUpdating,
  onFormChange,
  onSave,
  onCancel
}: UserEditModalProps) {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
              <Edit className="w-5 h-5 text-[#83e9ff]" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold">Edit User</DialogTitle>
              <p className="text-text-secondary text-xs mt-0.5">{user.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Name</Label>
            <Input
              id="name"
              value={editForm.name || ''}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              className="bg-[#0A0D12] border-border-subtle text-white focus:border-[#83E9FF]/50 text-sm h-9"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => onFormChange({ ...editForm, email: e.target.value })}
              className="bg-[#0A0D12] border-border-subtle text-white focus:border-[#83E9FF]/50 text-sm h-9"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Role</Label>
            <Select
              value={editForm.role || 'USER'}
              onValueChange={(value) => onFormChange({ ...editForm, role: value as "USER" | "MODERATOR" | "ADMIN" })}
            >
              <SelectTrigger className="bg-[#0A0D12] border-border-subtle text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-secondary border-border-hover">
                <SelectItem value="USER" className="text-white hover:bg-white/5 text-sm">User</SelectItem>
                <SelectItem value="MODERATOR" className="text-white hover:bg-white/5 text-sm">Moderator</SelectItem>
                <SelectItem value="ADMIN" className="text-white hover:bg-white/5 text-sm">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#0A0D12] rounded-xl border border-border-subtle">
            <div>
              <Label htmlFor="verified" className="text-white text-sm font-medium">Verified</Label>
              <p className="text-text-muted text-xs mt-0.5">User has verified their account</p>
            </div>
            <Switch
              id="verified"
              checked={editForm.verified || false}
              onCheckedChange={(checked) => onFormChange({ ...editForm, verified: checked })}
              className="data-[state=checked]:bg-[#83E9FF] data-[state=unchecked]:bg-zinc-700"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border-subtle">
          <Button
            onClick={onSave}
            disabled={isUpdating}
            className="flex-1 bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FF]/80 font-medium text-sm h-9"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="border border-border-hover text-white/80 hover:text-white hover:bg-white/5 text-sm h-9"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}