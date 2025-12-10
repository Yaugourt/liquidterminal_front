"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white font-inter text-base">Edit {user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-white font-inter text-sm">Name</Label>
            <Input
              id="name"
              value={editForm.name || ''}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              className="bg-brand-tertiary border-[#83E9FF4D] text-white focus:border-brand-accent font-inter text-sm h-8"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white font-inter text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => onFormChange({ ...editForm, email: e.target.value })}
              className="bg-brand-tertiary border-[#83E9FF4D] text-white focus:border-brand-accent font-inter text-sm h-8"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-white font-inter text-sm">Role</Label>
            <Select
              value={editForm.role || 'USER'}
              onValueChange={(value) => onFormChange({ ...editForm, role: value as "USER" | "MODERATOR" | "ADMIN"})}
            >
              <SelectTrigger className="bg-brand-tertiary border-[#83E9FF4D] text-white font-inter text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-tertiary border-[#83E9FF4D]">
                <SelectItem value="USER" className="text-white hover:bg-[#83E9FF1A] font-inter text-sm">User</SelectItem>
                <SelectItem value="MODERATOR" className="text-white hover:bg-[#83E9FF1A] font-inter text-sm">Moderator</SelectItem>
                <SelectItem value="ADMIN" className="text-white hover:bg-[#83E9FF1A] font-inter text-sm">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="verified"
              checked={editForm.verified || false}
              onCheckedChange={(checked) => onFormChange({ ...editForm, verified: checked })}
              className="data-[state=checked]:bg-brand-accent data-[state=unchecked]:bg-[#83E9FF1A] scale-75"
            />
            <Label htmlFor="verified" className="text-white font-inter text-sm">Verified</Label>
          </div>
          <div className="flex space-x-2 pt-3">
            <Button
              onClick={onSave}
              disabled={isUpdating}
              className="flex-1 bg-brand-gold text-brand-tertiary hover:bg-[#f9e370CC] font-inter text-sm h-8"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-[#83E9FF4D] text-brand-accent hover:bg-[#83E9FF1A] font-inter text-sm h-8"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 