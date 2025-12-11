"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="glass-panel border-none shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-3 h-3 text-brand-gold" />
            <Input
              placeholder="Search for a user..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="glass-input text-white placeholder:text-zinc-500 focus:border-brand-accent font-inter text-sm h-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-3 h-3 text-brand-gold" />
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-40 glass-input text-white font-inter text-sm h-8">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10 font-inter text-sm">All roles</SelectItem>
                <SelectItem value="USER" className="text-white hover:bg-white/10 font-inter text-sm">User</SelectItem>
                <SelectItem value="MODERATOR" className="text-white hover:bg-white/10 font-inter text-sm">Moderator</SelectItem>
                <SelectItem value="ADMIN" className="text-white hover:bg-white/10 font-inter text-sm">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 