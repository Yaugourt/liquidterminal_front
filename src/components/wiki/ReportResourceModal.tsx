"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReportResource } from "@/services/wiki";
import { toast } from "sonner";
import { Flag, Loader2, AlertCircle } from "lucide-react";

interface ReportResourceModalProps {
    resourceId: number;
    resourceTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportResourceModal({
    resourceId,
    resourceTitle,
    open,
    onOpenChange
}: ReportResourceModalProps) {
    const [reason, setReason] = useState("");
    const { report, isLoading, isDuplicateReport } = useReportResource();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim() || reason.length < 10) {
            toast.error("La raison doit contenir au moins 10 caractères");
            return;
        }

        if (reason.length > 500) {
            toast.error("La raison ne doit pas dépasser 500 caractères");
            return;
        }

        try {
            await report(resourceId, { reason: reason.trim() });
            toast.success("Signalement envoyé. Merci pour votre contribution !");
            setReason("");
            onOpenChange(false);
        } catch {
            if (isDuplicateReport) {
                toast.error("Vous avez déjà signalé cette ressource");
            } else {
                toast.error("Erreur lors du signalement");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20 text-white max-w-md">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Flag className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold">Report Resource</DialogTitle>
                        <DialogDescription className="text-text-secondary text-sm">
                            Report inappropriate or broken content
                        </DialogDescription>
                    </div>
                </div>

                <div className="text-sm text-white/80 p-3 bg-brand-dark rounded-lg border border-border-subtle mb-4">
                    <span className="text-text-muted">Reporting:</span> {resourceTitle}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                            Reason for report *
                        </label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe why you're reporting this resource (10-500 characters)"
                            className="bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50 min-h-[100px]"
                            required
                            maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-text-muted">
                            <span>{reason.length < 10 && reason.length > 0 && (
                                <span className="text-amber-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Minimum 10 characters
                                </span>
                            )}</span>
                            <span>{reason.length}/500</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || reason.length < 10}
                            className="bg-rose-500 hover:bg-rose-500/90 text-white font-semibold rounded-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Flag className="w-4 h-4 mr-2" />
                                    Submit Report
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
