"use client";

import { useState } from "react";
import { usePendingResources, usePendingCount, useModerationActions } from "@/services/wiki";
import { EducationalResource } from "@/services/wiki/types";
import { useLinkPreview } from "@/services/wiki/linkPreview/hooks/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Shield,
    CheckCircle,
    XCircle,
    ExternalLink,
    Loader2,
    RefreshCw,
    Clock
} from "lucide-react";
import { toast } from "sonner";

function PendingResourceItem({
    resource,
    onApprove,
    onReject,
    isApproving,
    isRejecting
}: {
    resource: EducationalResource;
    onApprove: (id: number, notes?: string) => void;
    onReject: (id: number, notes: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
}) {
    const { data: preview, isLoading } = useLinkPreview(resource.url);
    const [rejectNotes, setRejectNotes] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleReject = () => {
        if (!rejectNotes.trim()) {
            toast.error("Une raison est requise pour le rejet");
            return;
        }
        onReject(resource.id, rejectNotes);
        setShowRejectForm(false);
        setRejectNotes("");
    };

    return (
        <div className="p-3 bg-brand-dark rounded-xl border border-border-subtle space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-white hover:text-brand-accent transition-colors flex items-center gap-2"
                    >
                        {isLoading ? "Loading..." : (preview?.title || resource.url)}
                        <ExternalLink className="w-3 h-3 text-text-muted flex-shrink-0" />
                    </a>
                    <div className="text-xs text-text-muted mt-1">
                        Soumis par {resource.creator?.name || "Unknown"} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {!showRejectForm ? (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => onApprove(resource.id)}
                        disabled={isApproving || isRejecting}
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                    >
                        {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        Approuver
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowRejectForm(true)}
                        disabled={isApproving || isRejecting}
                        className="text-rose-400 hover:bg-rose-500/10"
                    >
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejeter
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <Input
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Raison du rejet (obligatoire)"
                        className="bg-brand-secondary border-border-subtle text-white text-sm"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleReject}
                            disabled={isRejecting}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                        >
                            {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmer le rejet"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setShowRejectForm(false); setRejectNotes(""); }}
                            disabled={isRejecting}
                            className="text-text-secondary"
                        >
                            Annuler
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function WikiModerationCard() {
    const { resources, isLoading, refetch } = usePendingResources();
    const { count } = usePendingCount();
    const { approve, reject, isApproving, isRejecting } = useModerationActions();

    const handleApprove = async (resourceId: number, notes?: string) => {
        try {
            await approve(resourceId, { notes });
            toast.success("Ressource approuvée");
            refetch();
        } catch {
            toast.error("Erreur lors de l'approbation");
        }
    };

    const handleReject = async (resourceId: number, notes: string) => {
        try {
            await reject(resourceId, { notes });
            toast.success("Ressource rejetée");
            refetch();
        } catch {
            toast.error("Erreur lors du rejet");
        }
    };

    return (
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Wiki Moderation</h3>
                        <p className="text-xs text-text-muted">Resources pending review</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-md border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {count}
                        </span>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="h-7 w-7 text-text-secondary hover:text-white"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-sm">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400/50" />
                        No pending resources
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {resources.map(resource => (
                            <PendingResourceItem
                                key={resource.id}
                                resource={resource}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isApproving={isApproving}
                                isRejecting={isRejecting}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
