"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useReviewPublicGood, PublicGood } from "@/services/ecosystem/publicgood";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: PublicGood;
}

type ReviewStatus = 'APPROVED' | 'REJECTED' | '';

export function ReviewModal({ isOpen, onClose, onSuccess, project }: ReviewModalProps) {
  const [status, setStatus] = useState<ReviewStatus>('');
  const [notes, setNotes] = useState("");
  const { reviewPublicGood, isLoading: isSubmitting } = useReviewPublicGood();

  const handleSubmit = async () => {
    if (!status) {
      toast.error("Please select a review status");
      return;
    }

    try {
      await reviewPublicGood(project.id, {
        status,
        reviewNotes: notes || undefined
      });

      const statusLabel = status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Project ${statusLabel} successfully!`);

      resetForm();
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to review project. Please try again.");
    }
  };

  const resetForm = () => {
    setStatus('');
    setNotes("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Review: {project.name}</DialogTitle>
          <DialogDescription className="text-text-muted">
            {project.category}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 block">Review Decision *</Label>
              <RadioGroup value={status} onValueChange={(val: string) => setStatus(val as ReviewStatus)} className="space-y-2">
                <div className="flex items-start space-x-3 p-4 border border-border-subtle rounded-xl hover:border-emerald-500/30 transition-colors bg-black/20">
                  <RadioGroupItem value="APPROVED" id="approved" className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="approved" className="text-white cursor-pointer flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Approve Project
                    </label>
                    <p className="text-sm text-text-muted mt-1">
                      The project meets the requirements and will be published in the public goods directory.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border border-border-subtle rounded-xl hover:border-rose-500/30 transition-colors bg-black/20">
                  <RadioGroupItem value="REJECTED" id="rejected" className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="rejected" className="text-white cursor-pointer flex items-center gap-2 font-medium">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      Reject Project
                    </label>
                    <p className="text-sm text-text-muted mt-1">
                      The project doesn&apos;t meet the requirements or needs improvements before approval.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Review Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any comments or feedback for the submitter..."
                rows={3}
                className="bg-black/20 border border-border-hover focus:border-brand-accent/50 outline-none transition-colors mt-2 rounded-lg placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !status}
              className={`rounded-lg font-semibold ${status === 'APPROVED'
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : status === 'REJECTED'
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-brand-accent text-brand-tertiary hover:bg-brand-accent/90"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

