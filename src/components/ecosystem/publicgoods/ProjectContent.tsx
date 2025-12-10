"use client";

import { Badge } from "@/components/ui/badge";
import { User, Mail, Users, Code2, DollarSign, Globe } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";

interface ProjectContentProps {
    project: PublicGood;
}

export function ProjectContent({ project }: ProjectContentProps) {
    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Section 2: Impact HyperLiquid */}
            <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Impact on HyperLiquid</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Problem Solved</h3>
                        <p className="text-zinc-400 text-sm">{project.problemSolved}</p>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Target Users</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.targetUsers.map(user => (
                                <Badge key={user} variant="outline" className="border-white/10 text-zinc-400 text-xs">
                                    {user}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">HyperLiquid Integration</h3>
                        <p className="text-zinc-400 text-sm">{project.hlIntegration}</p>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Development Status</h3>
                        <Badge className="bg-brand-accent/10 text-brand-accent text-xs">
                            {project.developmentStatus}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Section 3: Team & Technical */}
            <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Team & Technical Details</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Lead Developer</h3>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-brand-accent" />
                            <span className="text-white text-sm">{project.leadDeveloperName}</span>
                            <Mail className="w-4 h-4 text-zinc-500 ml-2" />
                            <span className="text-zinc-400 text-sm">{project.leadDeveloperContact}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Team Size</h3>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-accent" />
                                <span className="text-white text-sm">{project.teamSize}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Experience Level</h3>
                            <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                                {project.experienceLevel}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Category</h3>
                            <Badge className="bg-brand-accent/10 text-brand-accent text-xs">
                                {project.category}
                            </Badge>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Technologies Used</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map(tech => (
                                <Badge key={tech} variant="outline" className="border-brand-accent/20 text-brand-accent text-xs">
                                    <Code2 className="w-3 h-3 mr-1" />
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Support Requested */}
            {(project.supportTypes.length > 0 || project.budgetRange) && (
                <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Support Requested</h2>

                    <div className="space-y-4">
                        {project.supportTypes.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Types of Support</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.supportTypes.map((type: string) => (
                                        <div key={type} className="flex items-center gap-2 bg-brand-dark border border-white/5 px-3 py-1.5 rounded-lg">
                                            {type === 'FUNDING' && <DollarSign className="w-4 h-4 text-amber-400" />}
                                            {type === 'PROMOTION' && <Globe className="w-4 h-4 text-brand-accent" />}
                                            {type === 'SERVICES' && <Code2 className="w-4 h-4 text-purple-400" />}
                                            {type === 'CONTRIBUTOR' && <Users className="w-4 h-4 text-emerald-400" />}
                                            <span className="text-white text-xs capitalize">{type.toLowerCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.supportTypes.includes('CONTRIBUTOR') && project.contributorTypes.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Looking for Contributors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.contributorTypes.map((type: string) => (
                                        <div key={type} className="flex items-center gap-2 bg-brand-dark border border-white/5 px-3 py-1.5 rounded-lg">
                                            <Users className="w-4 h-4 text-emerald-400" />
                                            <span className="text-white text-xs capitalize">{type.toLowerCase().replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.budgetRange && (
                            <div>
                                <h3 className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider mb-2">Budget Range</h3>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-amber-400" />
                                    <span className="text-white text-sm">{project.budgetRange.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
