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
import type { PublicGoodsProject } from "./mockData";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: PublicGood | PublicGoodsProject;
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0A1F32] border-[#1E3851]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Review: {project.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {project.category}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-3 block">Review Decision *</Label>
              <RadioGroup value={status} onValueChange={(val: string) => setStatus(val as ReviewStatus)}>
                <div className="flex items-start space-x-3 p-4 border border-[#1E3851] rounded-lg hover:border-green-500/50 transition-colors">
                  <RadioGroupItem value="APPROVED" id="approved" className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="approved" className="text-white cursor-pointer flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Approve Project
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      The project meets the requirements and will be published in the public goods directory.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-[#1E3851] rounded-lg hover:border-red-500/50 transition-colors">
                  <RadioGroupItem value="REJECTED" id="rejected" className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="rejected" className="text-white cursor-pointer flex items-center gap-2 font-medium">
                      <XCircle className="w-5 h-5 text-red-400" />
                      Reject Project
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      The project doesn&apos;t meet the requirements or needs improvements before approval.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">Review Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any comments or feedback for the submitter..."
                rows={3}
                className="bg-[#112941] border-[#1E3851] text-white mt-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#1E3851]">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-[#1E3851] text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !status}
              className={
                status === 'APPROVED'
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : status === 'REJECTED'
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
              }
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

