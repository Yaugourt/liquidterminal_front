"use client";

import { useMySubmissions } from "@/services/wiki";
import { ResourceStatus } from "@/services/wiki/types";
import { ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useLinkPreview } from "@/services/wiki/linkPreview/hooks/hooks";

const statusConfig: Record<ResourceStatus, { icon: typeof Clock; label: string; color: string }> = {
    PENDING: { icon: Clock, label: "En attente", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    APPROVED: { icon: CheckCircle, label: "Approuvé", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    REJECTED: { icon: XCircle, label: "Rejeté", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

function SubmissionItem({ resource }: { resource: { id: number; url: string; status: ResourceStatus; reviewNotes?: string; createdAt: string } }) {
    const { data: preview, isLoading } = useLinkPreview(resource.url);
    const config = statusConfig[resource.status];
    const StatusIcon = config.icon;

    return (
        <div className="p-3 bg-brand-dark rounded-xl border border-border-subtle hover:border-border-hover transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white hover:text-brand-accent transition-colors truncate"
                        >
                            {isLoading ? "Loading..." : (preview?.title || resource.url)}
                        </a>
                        <ExternalLink className="w-3 h-3 text-text-muted flex-shrink-0" />
                    </div>
                    <div className="text-xs text-text-muted truncate">
                        {new URL(resource.url).hostname}
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{config.label}</span>
                </div>
            </div>
            {resource.status === "REJECTED" && resource.reviewNotes && (
                <div className="mt-2 p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs text-rose-300">
                    <strong>Raison:</strong> {resource.reviewNotes}
                </div>
            )}
        </div>
    );
}

export function MySubmissionsList() {
    const { submissions, isLoading, error } = useMySubmissions();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-rose-400 text-sm">
                Erreur lors du chargement
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8 text-text-muted text-sm">
                Aucune soumission pour le moment.
            </div>
        );
    }

    const pending = submissions.filter(s => s.status === "PENDING");
    const approved = submissions.filter(s => s.status === "APPROVED");
    const rejected = submissions.filter(s => s.status === "REJECTED");

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="flex gap-4 text-xs">
                <span className="text-amber-400">{pending.length} en attente</span>
                <span className="text-emerald-400">{approved.length} approuvé(s)</span>
                <span className="text-rose-400">{rejected.length} rejeté(s)</span>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {submissions.map(resource => (
                    <SubmissionItem key={resource.id} resource={resource} />
                ))}
            </div>
        </div>
    );
}
