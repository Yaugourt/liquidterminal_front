import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Mail, Users, Code2, DollarSign, Globe } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";

interface ProjectContentProps {
    project: PublicGood;
}

export function ProjectContent({ project }: ProjectContentProps) {
    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Section 2: Impact HyperLiquid */}
            <Card padding="lg">
                <h2 className="text-lg font-bold text-text-primary mb-4">Impact on HyperLiquid</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-label text-brand mb-2">Problem Solved</h3>
                        <p className="text-text-secondary text-sm">{project.problemSolved}</p>
                    </div>

                    <div>
                        <h3 className="text-label text-brand mb-2">Target Users</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.targetUsers.map(user => (
                                <Badge key={user} variant="outline" className="border-border-default text-text-secondary text-xs">
                                    {user}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-label text-brand mb-2">HyperLiquid Integration</h3>
                        <p className="text-text-secondary text-sm">{project.hlIntegration}</p>
                    </div>

                    <div>
                        <h3 className="text-label text-brand mb-2">Development Status</h3>
                        <Badge className="bg-brand/10 text-brand text-xs">
                            {project.developmentStatus}
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Section 3: Team & Technical */}
            <Card padding="lg">
                <h2 className="text-lg font-bold text-text-primary mb-4">Team & Technical Details</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-label text-brand mb-2">Lead Developer</h3>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-brand" />
                            <span className="text-text-primary text-sm">{project.leadDeveloperName}</span>
                            <Mail className="w-4 h-4 text-text-tertiary ml-2" />
                            <span className="text-text-secondary text-sm">{project.leadDeveloperContact}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="text-label text-brand mb-2">Team Size</h3>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand" />
                                <span className="text-text-primary text-sm">{project.teamSize}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-label text-brand mb-2">Experience Level</h3>
                            <Badge variant="outline" className="border-border-default text-text-secondary text-xs">
                                {project.experienceLevel}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-label text-brand mb-2">Category</h3>
                            <Badge className="bg-brand/10 text-brand text-xs">
                                {project.category}
                            </Badge>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-label text-brand mb-2">Technologies Used</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map(tech => (
                                <Badge key={tech} variant="outline" className="border-brand/20 text-brand text-xs">
                                    <Code2 className="w-3 h-3 mr-1" />
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Section 4: Support Requested */}
            {(project.supportTypes.length > 0 || project.budgetRange) && (
                <Card padding="lg">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Support Requested</h2>

                    <div className="space-y-4">
                        {project.supportTypes.length > 0 && (
                            <div>
                                <h3 className="text-label text-brand mb-2">Types of Support</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.supportTypes.map((type: string) => (
                                        <div key={type} className="flex items-center gap-2 bg-base border border-border-subtle px-3 py-1.5 rounded-lg">
                                            {type === 'FUNDING' && <DollarSign className="w-4 h-4 text-gold" />}
                                            {type === 'PROMOTION' && <Globe className="w-4 h-4 text-brand" />}
                                            {type === 'SERVICES' && <Code2 className="w-4 h-4 text-brand" />}
                                            {type === 'CONTRIBUTOR' && <Users className="w-4 h-4 text-success" />}
                                            <span className="text-text-primary text-xs capitalize">{type.toLowerCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.supportTypes.includes('CONTRIBUTOR') && project.contributorTypes.length > 0 && (
                            <div>
                                <h3 className="text-label text-brand mb-2">Looking for Contributors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.contributorTypes.map((type: string) => (
                                        <div key={type} className="flex items-center gap-2 bg-base border border-border-subtle px-3 py-1.5 rounded-lg">
                                            <Users className="w-4 h-4 text-success" />
                                            <span className="text-text-primary text-xs capitalize">{type.toLowerCase().replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.budgetRange && (
                            <div>
                                <h3 className="text-label text-brand mb-2">Budget Range</h3>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gold" />
                                    <span className="text-text-primary text-sm">{project.budgetRange.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
