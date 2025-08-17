"use client";

import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; isPublic?: boolean }) => void;
  isLoading: boolean;
  error?: string | null;
}

export function CreateListModal({ isOpen, onClose, onSubmit, isLoading, error }: CreateListModalProps) {
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      isPublic: formData.get('isPublic') === 'on'
    });
  }, [onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-[#051728] border-2 border-[#83E9FF4D] p-6 max-w-md w-full mx-4">
        <h2 className="text-white text-xl font-semibold mb-4">Create Read List</h2>
        <form onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="Read list name"
            required
            minLength={2}
            maxLength={255}
            className="mb-4 bg-[#112941] border-[#83E9FF4D] text-white"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            maxLength={500}
            className="w-full mb-4 p-2 bg-[#112941] border border-[#83E9FF4D] text-white rounded-md"
            rows={3}
          />
          <div className="mb-4">
            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                name="isPublic"
                className="w-4 h-4 rounded border-[#83E9FF4D] bg-[#112941] text-[#83E9FF] focus:ring-[#83E9FF]"
              />
              Make this list public
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728]"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </form>
      </Card>
    </div>
  );
} 