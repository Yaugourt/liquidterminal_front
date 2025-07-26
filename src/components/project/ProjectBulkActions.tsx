"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, X } from "lucide-react";
import { Project } from "@/services/project/types";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { toast } from "sonner";

interface ProjectBulkActionsProps {
  projects: Project[];
  selectedProjects: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  onBulkDelete: (projectIds: number[]) => Promise<void>;
  isDeleting: boolean;
}

export function ProjectBulkActions({
  projects,
  selectedProjects,
  onSelectionChange,
  onBulkDelete,
  isDeleting
}: ProjectBulkActionsProps) {
  const { user } = useAuthContext();
  const [showBulkActions, setShowBulkActions] = useState(false);

  const selectedCount = selectedProjects.length;
  const totalCount = projects.length;

  const handleSelectAll = () => {
    if (selectedCount === totalCount) {
      onSelectionChange([]);
    } else {
      onSelectionChange(projects.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    try {
      await onBulkDelete(selectedProjects);
      onSelectionChange([]);
      setShowBulkActions(false);
      toast.success(`${selectedCount} project${selectedCount > 1 ? 's' : ''} deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete projects");
    }
  };

  const handleCancelSelection = () => {
    onSelectionChange([]);
    setShowBulkActions(false);
  };

  // Show bulk actions only if admin and there are projects
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left side - Select all checkbox */}
      <div className="flex items-center gap-3">
        <ProtectedAction requiredRole="ADMIN" user={user}>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCount === totalCount && totalCount > 0}
              onCheckedChange={handleSelectAll}
              disabled={isDeleting}
              className="data-[state=checked]:bg-[#F9E370] data-[state=checked]:border-[#F9E370]"
            />
            <span className="text-sm text-[#F9E370] font-medium">
              Select all ({totalCount})
            </span>
          </div>
        </ProtectedAction>
      </div>

      {/* Right side - Bulk actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#F9E370] font-medium">
            {selectedCount} project{selectedCount > 1 ? 's' : ''} selected
          </span>
          
          <Button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedCount}
          </Button>
          
          <Button
            onClick={handleCancelSelection}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 