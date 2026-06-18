"use client";

import { useMySubmissions } from "@/services/wiki";
import { ResourceStatus } from "@/services/wiki/types";
import { ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { useLinkPreview } from "@/services/wiki/linkPreview/hooks/hooks";
import { safeHref } from "@/lib/safeUrl";

const statusConfig: Record<ResourceStatus, { icon: typeof Clock; label: string; color: string }> = {
    PENDING: { icon: Clock, label: "En attente", color: "text-gold bg-gold/10 border-gold/20" },
    APPROVED: { icon: CheckCircle, label: "Approuvé", color: "text-success bg-success/10 border-success/20" },
    REJECTED: { icon: XCircle, label: "Rejeté", color: "text-danger bg-danger/10 border-danger/20" },
};

function SubmissionItem({ resource }: { resource: { id: number; url: string; status: ResourceStatus; reviewNotes?: string; createdAt: string } }) {
    const { data: preview, isLoading } = useLinkPreview(resource.url);
    const config = statusConfig[resource.status];
    const StatusIcon = config.icon;

    return (
        <div className="p-3 bg-base rounded-lg border border-border-subtle hover:border-border-default transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <a
                            href={safeHref(resource.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-text-primary hover:text-brand transition-colors truncate"
                        >
                            {isLoading ? "Loading..." : (preview?.title || resource.url)}
                        </a>
                        <ExternalLink className="w-3 h-3 text-text-tertiary flex-shrink-0" />
                    </div>
                    <div className="text-xs text-text-tertiary truncate">
                        {new URL(resource.url).hostname}
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{config.label}</span>
                </div>
            </div>
            {resource.status === "REJECTED" && resource.reviewNotes && (
                <div className="mt-2 p-2 bg-danger/5 border border-danger/10 rounded-lg text-xs text-danger">
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
                <InlineSpinner className="w-5 h-5 text-brand" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-danger text-sm">
                Erreur lors du chargement
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8 text-text-tertiary text-sm">
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
                <span className="text-gold">{pending.length} en attente</span>
                <span className="text-success">{approved.length} approuvé(s)</span>
                <span className="text-danger">{rejected.length} rejeté(s)</span>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-brand">
                {submissions.map(resource => (
                    <SubmissionItem key={resource.id} resource={resource} />
                ))}
            </div>
        </div>
    );
}
