"use client";

import { useState } from "react";
import { usePendingResources, usePendingCount, useModerationActions } from "@/services/wiki";
import { EducationalResource } from "@/services/wiki/types";
import { safeHref } from "@/lib/safeUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
    Shield,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
    Clock
} from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
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
    const preview = resource.linkPreview;
    const [rejectNotes, setRejectNotes] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleReject = () => {
        if (!rejectNotes.trim()) {
            toast.error("A reason is required to reject");
            return;
        }
        onReject(resource.id, rejectNotes);
        setShowRejectForm(false);
        setRejectNotes("");
    };

    return (
        <div className="p-3 bg-base rounded-lg border border-border-subtle space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <a
                        href={safeHref(resource.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-text-primary hover:text-brand transition-colors flex items-center gap-2"
                    >
                        {preview?.title || resource.url}
                        <ExternalLink className="w-3 h-3 text-text-tertiary flex-shrink-0" />
                    </a>
                    <div className="text-xs text-text-tertiary mt-1">
                        Submitted by {resource.creator?.name || "Unknown"} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {!showRejectForm ? (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => onApprove(resource.id)}
                        disabled={isApproving || isRejecting}
                        className="bg-success/10 text-success hover:bg-success/20 border border-success/20"
                    >
                        {isApproving ? <InlineSpinner className="w-3 h-3" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowRejectForm(true)}
                        disabled={isApproving || isRejecting}
                        className="text-danger hover:bg-danger/10"
                    >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <Input
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Rejection reason (required)"
                        className="bg-surface border-border-subtle text-text-primary text-sm"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleReject}
                            disabled={isRejecting}
                            className="bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20"
                        >
                            {isRejecting ? <InlineSpinner className="w-3 h-3" /> : "Confirm rejection"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setShowRejectForm(false); setRejectNotes(""); }}
                            disabled={isRejecting}
                            className="text-text-secondary"
                        >
                            Cancel
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
            toast.success("Resource approved");
            refetch();
        } catch {
            toast.error("Failed to approve resource");
        }
    };

    const handleReject = async (resourceId: number, notes: string) => {
        try {
            await reject(resourceId, { notes });
            toast.success("Resource rejected");
            refetch();
        } catch {
            toast.error("Failed to reject resource");
        }
    };

    return (
        <Card>
            {/* Header */}
            <CardHeader density="compact" className="border-b border-border-subtle flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gold/10 rounded-lg">
                        <Shield className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                        <h3 className="text-text-primary font-semibold text-sm">Wiki Moderation</h3>
                        <p className="text-xs text-text-tertiary">Resources pending review</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-md border border-gold/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {count}
                        </span>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="h-7 w-7 text-text-secondary hover:text-text-primary"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent density="compact">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <InlineSpinner className="w-5 h-5 text-brand" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-8 text-text-tertiary text-sm">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success/50" />
                        No pending resources
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-brand">
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
            </CardContent>
        </Card>
    );
}
