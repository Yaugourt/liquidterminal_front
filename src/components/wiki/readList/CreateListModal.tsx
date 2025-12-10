"use client";

import { useCallback } from "react";
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-brand-secondary border border-white/10 rounded-2xl shadow-xl shadow-black/20 p-6 max-w-md w-full mx-4">
        <h2 className="text-white text-lg font-bold mb-4">Create Read List</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Name</label>
              <Input
                name="name"
                placeholder="Read list name"
                required
                minLength={2}
                maxLength={255}
                className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Description (optional)"
                maxLength={500}
                className="w-full p-3 bg-brand-dark border border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50 focus:outline-none transition-colors"
                rows={3}
              />
            </div>
            <div className="p-3 bg-brand-dark border border-white/5 rounded-lg">
              <label className="flex items-center gap-3 text-zinc-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  className="w-4 h-4 rounded border-white/10 bg-brand-dark text-brand-accent focus:ring-brand-accent focus:ring-offset-0"
                />
                <span>Make this list public</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
          {error && (
            <p className="text-rose-400 text-sm mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
} 