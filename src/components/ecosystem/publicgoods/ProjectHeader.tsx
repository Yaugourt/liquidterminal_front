"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Globe, ExternalLink } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { useState } from "react";

interface ProjectHeaderProps {
    project: PublicGood;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                        {/* Logo */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                            {project.logo && !imageError ? (
                                <Image
                                    src={project.logo}
                                    alt={project.name}
                                    fill
                                    className="rounded-xl object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-brand-accent/10 flex items-center justify-center">
                                    <span className="text-brand-accent text-2xl font-bold">
                                        {project.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Title and status */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                                <ProjectStatusBadge status={project.status} />
                            </div>
                            <p className="text-lg text-gray-300">{project.description}</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4">
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-brand-accent hover:text-white transition-colors"
                            >
                                <Github className="w-5 h-5" />
                                GitHub
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                        {project.websiteUrl && (
                            <Link
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-brand-accent hover:text-white transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                Website
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                        {project.demoUrl && (
                            <Link
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#F9E370] hover:text-white transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                Demo
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Submitted</div>
                    <div className="text-brand-accent font-medium">{new Date(project.submittedAt).toLocaleDateString()}</div>
                    {project.reviewedAt && (
                        <>
                            <div className="text-sm text-gray-400 mb-1 mt-2">Reviewed</div>
                            <div className="text-brand-accent font-medium">{new Date(project.reviewedAt).toLocaleDateString()}</div>
                        </>
                    )}
                </div>
            </div>

            {/* Banner */}
            {project.banner && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden">
                    <Image
                        src={project.banner}
                        alt={`${project.name} banner`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F32]/60 to-transparent" />
                </div>
            )}
        </div>
    );
}
