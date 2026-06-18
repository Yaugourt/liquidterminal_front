"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Mail, CheckCircle, Edit, Trash2 } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { Card } from "@/components/ui/card";

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
            <Card className="p-6">
                <h3 className="text-sm font-bold text-text-primary mb-4">Contact</h3>
                <div className="space-y-3">
                    {project.discordContact && (
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-brand" />
                            <span className="text-text-secondary text-sm">{project.discordContact}</span>
                        </div>
                    )}
                    {project.telegramContact && (
                        <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-brand-telegram" />
                            <span className="text-text-secondary text-sm">{project.telegramContact}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-secondary text-sm">{project.leadDeveloperContact}</span>
                    </div>
                </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
                <h3 className="text-sm font-bold text-text-primary mb-4">Project Info</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-text-tertiary text-xs">Status</span>
                        <ProjectStatusBadge status={project.status} className="border text-xs" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-tertiary text-xs">Category</span>
                        <span className="text-brand text-xs font-medium lowercase first-letter:uppercase">{project.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-tertiary text-xs">Team Size</span>
                        <span className="text-brand text-xs font-medium lowercase first-letter:uppercase">{project.teamSize.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-tertiary text-xs">Experience</span>
                        <span className="text-brand text-xs font-medium lowercase first-letter:uppercase">{project.experienceLevel.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-tertiary text-xs">Stage</span>
                        <span className="text-brand text-xs font-medium lowercase first-letter:uppercase">{project.developmentStatus.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            </Card>

            {/* Actions */}
            {(canEdit || canDelete || canReview) && (
                <Card className="p-6">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Manage Project</h3>
                    <div className="space-y-3">
                        {canReview && onReview && (
                            <Button
                                onClick={onReview}
                                className="w-full bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Review Project
                            </Button>
                        )}
                        {canEdit && onEdit && (
                            <Button
                                onClick={onEdit}
                                variant="outline"
                                className="w-full border-border-subtle interactive-secondary rounded-lg"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Project
                            </Button>
                        )}
                        {canDelete && onDelete && (
                            <Button
                                onClick={onDelete}
                                variant="outline"
                                className="w-full border-danger/20 text-danger hover:bg-danger/10 hover:text-danger rounded-lg"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
