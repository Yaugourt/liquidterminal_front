"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Lock, BookOpen } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; isPublic?: boolean }) => void;
  isLoading: boolean;
  error?: string | null;
}

export function CreateListModal({ isOpen, onClose, onSubmit, isLoading, error }: CreateListModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
    });
  }, [onSubmit, isPublic, name, description]);

  const handleClose = () => {
    setName("");
    setDescription("");
    setIsPublic(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-surface border-border-default sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-subtle bg-gradient-to-r from-brand/5 to-transparent">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-brand" />
              </div>
              <div>
                <DialogTitle className="text-text-primary font-bold">Create Read List</DialogTitle>
                <p className="text-xs text-text-tertiary mt-0.5">Organize your reading with a curated list</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                Name <span className="text-rose-400">*</span>
              </label>
              <Input
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. DeFi Deep Dives"
                required
                minLength={2}
                maxLength={255}
                className="bg-base border-border-subtle text-text-primary rounded-lg placeholder:text-text-tertiary focus:border-brand/50 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                Description
                <span className="ml-1.5 text-text-tertiary normal-case font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this list about?"
                maxLength={500}
                className="w-full p-3 bg-base border border-border-subtle text-text-primary rounded-lg placeholder:text-text-tertiary focus:border-brand/50 focus:outline-none transition-colors min-h-[80px] text-sm resize-none"
                rows={3}
              />
              <p className="text-xs text-text-tertiary text-right">{description.length}/500</p>
            </div>

            {/* Visibility toggle */}
            <div
              className={`p-4 rounded-xl border cursor-pointer transition-all ${isPublic
                ? "bg-brand/5 border-brand/25"
                : "bg-base border-border-subtle hover:border-border-default"
                }`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isPublic ? "bg-brand/20" : "bg-white/5"}`}>
                    {isPublic ? (
                      <Globe className="w-4 h-4 text-brand" />
                    ) : (
                      <Lock className="w-4 h-4 text-text-tertiary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {isPublic ? "Public list" : "Private list"}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {isPublic
                        ? "Visible to everyone · earns +20 XP"
                        : "Only you can see this · earns +15 XP"
                      }
                    </p>
                  </div>
                </div>
                <Checkbox
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-rose-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex gap-2 justify-end px-6 pb-6 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="interactive-secondary rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg min-w-[100px]"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create List'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
