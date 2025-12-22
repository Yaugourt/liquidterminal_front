"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Mail, CheckCircle, Edit, Trash2 } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

interface ProjectInfoSidebarProps {
    project: PublicGood;
    canEdit?: boolean;
    canDelete?: boolean;
    canReview?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onReview?: () => void;
}

export function ProjectInfoSidebar({
    project,
    canEdit = false,
    canDelete = false,
    canReview = false,
    onEdit,
    onDelete,
    onReview
}: ProjectInfoSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Contact */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                    {project.discordContact && (
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                            <span className="text-text-secondary text-sm">{project.discordContact}</span>
                        </div>
                    )}
                    {project.telegramContact && (
                        <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-[#0088CC]" />
                            <span className="text-text-secondary text-sm">{project.telegramContact}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-text-muted" />
                        <span className="text-text-secondary text-sm">{project.leadDeveloperContact}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">Project Info</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted text-xs">Status</span>
                        <ProjectStatusBadge status={project.status} className="border text-xs" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted text-xs">Category</span>
                        <span className="text-brand-accent text-xs font-medium lowercase first-letter:uppercase">{project.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted text-xs">Team Size</span>
                        <span className="text-brand-accent text-xs font-medium lowercase first-letter:uppercase">{project.teamSize.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted text-xs">Experience</span>
                        <span className="text-brand-accent text-xs font-medium lowercase first-letter:uppercase">{project.experienceLevel.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-muted text-xs">Stage</span>
                        <span className="text-brand-accent text-xs font-medium lowercase first-letter:uppercase">{project.developmentStatus.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {(canEdit || canDelete || canReview) && (
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-4">Manage Project</h3>
                    <div className="space-y-3">
                        {canReview && onReview && (
                            <Button
                                onClick={onReview}
                                className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Review Project
                            </Button>
                        )}
                        {canEdit && onEdit && (
                            <Button
                                onClick={onEdit}
                                variant="outline"
                                className="w-full border-border-subtle text-text-secondary hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Project
                            </Button>
                        )}
                        {canDelete && onDelete && (
                            <Button
                                onClick={onDelete}
                                variant="outline"
                                className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
