"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  selectedRole: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function UserFilters({
  searchTerm,
  selectedRole,
  onSearchChange,
  onRoleChange
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-[#0A0D12] border-border-subtle text-white placeholder:text-text-muted focus:border-[#83E9FF]/50 text-sm h-9"
        />
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
        <Select value={selectedRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-full sm:w-36 bg-[#0A0D12] border-border-subtle text-white text-sm h-9">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent className="bg-brand-secondary border-border-hover">
            <SelectItem value="all" className="text-white hover:bg-white/5 text-sm">All roles</SelectItem>
            <SelectItem value="USER" className="text-white hover:bg-white/5 text-sm">User</SelectItem>
            <SelectItem value="MODERATOR" className="text-white hover:bg-white/5 text-sm">Moderator</SelectItem>
            <SelectItem value="ADMIN" className="text-white hover:bg-white/5 text-sm">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}