"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import {
    validatePublicGoodForm,
    validateImageFile,
    validateScreenshots
} from "@/lib/publicgoods-helpers";
import { useCreatePublicGood, useUpdatePublicGood, PublicGood } from "@/services/ecosystem/publicgood";
import { ProjectTab, ImpactTab, TeamTab, SupportTab, PreviewTab } from "./modal";

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    /** Mode: 'create' for new projects, 'edit' for existing projects */
    mode: 'create' | 'edit';
    /** Project data for edit mode (required when mode is 'edit') */
    project?: PublicGood;
}

interface FormData {
    name: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    websiteUrl: string;
    category: string;
    discordContact: string;
    telegramContact: string;
    problemSolved: string;
    targetUsers: string[];
    hlIntegration: string;
    developmentStatus: string;
    leadDeveloperName: string;
    leadDeveloperContact: string;
    teamSize: string;
    experienceLevel: string;
    technologies: string[];
    supportTypes: string[];
    contributorTypes: string[];
    budgetRange: string;
}

const INITIAL_FORM_DATA: FormData = {
    name: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
    websiteUrl: "",
    category: "",
    discordContact: "",
    telegramContact: "",
    problemSolved: "",
    targetUsers: [],
    hlIntegration: "",
    developmentStatus: "",
    leadDeveloperName: "",
    leadDeveloperContact: "",
    teamSize: "",
    experienceLevel: "",
    technologies: [],
    supportTypes: [],
    contributorTypes: [],
    budgetRange: ""
};

export function ProjectFormModal({
    isOpen,
    onClose,
    onSuccess,
    mode,
    project
}: ProjectFormModalProps) {
    const [activeTab, setActiveTab] = useState("project");
    const { createPublicGood, isLoading: isCreating } = useCreatePublicGood();
    const { updatePublicGood, isLoading: isUpdating } = useUpdatePublicGood();

    const isSubmitting = mode === 'create' ? isCreating : isUpdating;

    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>("");
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
    const [techInput, setTechInput] = useState("");

    // Pre-fill form with project data in edit mode
    useEffect(() => {
        if (mode === 'edit' && project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                githubUrl: project.githubUrl || "",
                demoUrl: project.demoUrl || "",
                websiteUrl: project.websiteUrl || "",
                category: project.category || "",
                discordContact: project.discordContact || "",
                telegramContact: project.telegramContact || "",
                problemSolved: project.problemSolved || "",
                targetUsers: project.targetUsers || [],
                hlIntegration: project.hlIntegration || "",
                developmentStatus: project.developmentStatus || "",
                leadDeveloperName: project.leadDeveloperName || "",
                leadDeveloperContact: project.leadDeveloperContact || "",
                teamSize: project.teamSize || "",
                experienceLevel: project.experienceLevel || "",
                technologies: project.technologies || [],
                supportTypes: project.supportTypes || [],
                contributorTypes: project.contributorTypes || [],
                budgetRange: project.budgetRange || ""
            });

            if (project.logo) setLogoPreview(project.logo);
            if (project.banner) setBannerPreview(project.banner);
            if (project.screenshots?.length) setScreenshotPreviews(project.screenshots);
        }
    }, [mode, project]);

    // Reset form when modal closes or mode changes to create
    useEffect(() => {
        if (!isOpen || (mode === 'create' && !project)) {
            resetForm();
        }
    }, [isOpen, mode]);

    const updateField = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (mode === 'create') {
                const validation = validateImageFile(file, 2);
                if (!validation.valid) {
                    toast.error(validation.error);
                    return;
                }
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
            } else {
                setLogo(file);
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const removeLogo = () => {
        if (mode === 'create' && logoPreview) URL.revokeObjectURL(logoPreview);
        setLogo(null);
        setLogoPreview("");
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (mode === 'create') {
                const validation = validateImageFile(file, 5);
                if (!validation.valid) {
                    toast.error(validation.error);
                    return;
                }
                setBanner(file);
                setBannerPreview(URL.createObjectURL(file));
            } else {
                setBanner(file);
                const reader = new FileReader();
                reader.onloadend = () => setBannerPreview(reader.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const removeBanner = () => {
        if (mode === 'create' && bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBanner(null);
        setBannerPreview("");
    };

    const handleScreenshotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (mode === 'create') {
            const newScreenshots = [...screenshots, ...files];
            const validation = validateScreenshots(newScreenshots);
            if (!validation.valid) {
                toast.error(validation.errors.join(', '));
                return;
            }
            setScreenshots(newScreenshots);
            setScreenshotPreviews([
                ...screenshotPreviews,
                ...files.map(f => URL.createObjectURL(f))
            ]);
        } else {
            setScreenshots(prev => [...prev, ...files]);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setScreenshotPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeScreenshot = (index: number) => {
        if (mode === 'create') URL.revokeObjectURL(screenshotPreviews[index]);
        setScreenshots(prev => prev.filter((_, i) => i !== index));
        setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            updateField('technologies', [...formData.technologies, techInput.trim()]);
            setTechInput("");
        }
    };

    const removeTechnology = (tech: string) => {
        updateField('technologies', formData.technologies.filter(t => t !== tech));
    };

    const toggleTargetUser = (user: string) => {
        if (formData.targetUsers.includes(user)) {
            updateField('targetUsers', formData.targetUsers.filter(u => u !== user));
        } else {
            updateField('targetUsers', [...formData.targetUsers, user]);
        }
    };

    const toggleSupportType = (type: string) => {
        if (formData.supportTypes.includes(type)) {
            updateField('supportTypes', formData.supportTypes.filter(t => t !== type));
        } else {
            updateField('supportTypes', [...formData.supportTypes, type]);
        }
    };

    const toggleContributorType = (type: string) => {
        if (formData.contributorTypes.includes(type)) {
            updateField('contributorTypes', formData.contributorTypes.filter(t => t !== type));
        } else {
            updateField('contributorTypes', [...formData.contributorTypes, type]);
        }
    };

    const handleSubmit = async () => {
        const validation = validatePublicGoodForm({
            name: formData.name,
            description: formData.description,
            githubUrl: formData.githubUrl,
            category: formData.category,
            problemSolved: formData.problemSolved,
            targetUsers: formData.targetUsers,
            hlIntegration: formData.hlIntegration,
            developmentStatus: formData.developmentStatus,
            leadDeveloperName: formData.leadDeveloperName,
            leadDeveloperContact: formData.leadDeveloperContact,
            teamSize: formData.teamSize,
            experienceLevel: formData.experienceLevel,
            technologies: formData.technologies
        });

        if (!validation.valid) {
            toast.error(validation.errors[0]);
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            githubUrl: formData.githubUrl,
            demoUrl: formData.demoUrl || undefined,
            websiteUrl: formData.websiteUrl || undefined,
            category: formData.category,
            discordContact: formData.discordContact || undefined,
            telegramContact: formData.telegramContact || undefined,
            problemSolved: formData.problemSolved,
            targetUsers: formData.targetUsers,
            hlIntegration: formData.hlIntegration,
            developmentStatus: formData.developmentStatus as 'IDEA' | 'DEVELOPMENT' | 'BETA' | 'PRODUCTION',
            leadDeveloperName: formData.leadDeveloperName,
            leadDeveloperContact: formData.leadDeveloperContact,
            teamSize: formData.teamSize as 'SOLO' | 'SMALL' | 'LARGE',
            experienceLevel: formData.experienceLevel as 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT',
            technologies: formData.technologies,
            supportTypes: formData.supportTypes.length > 0
                ? formData.supportTypes as ('PROMOTION' | 'SERVICES' | 'FUNDING' | 'CONTRIBUTOR')[]
                : undefined,
            contributorTypes: formData.contributorTypes.length > 0
                ? formData.contributorTypes as ('DEVELOPERS' | 'DESIGNERS' | 'MARKETING_COMMUNITY' | 'TECHNICAL_WRITERS' | 'QA_TESTERS')[]
                : undefined,
            budgetRange: formData.budgetRange
                ? formData.budgetRange as 'RANGE_0_5K' | 'RANGE_5_15K' | 'RANGE_15_30K' | 'RANGE_30_50K' | 'RANGE_50K_PLUS'
                : undefined,
            logo: logo || undefined,
            banner: banner || undefined,
            screenshots: screenshots.length > 0 ? screenshots : undefined
        };

        try {
            if (mode === 'create') {
                await createPublicGood(payload);
                toast.success("Project submitted successfully! It will be reviewed by our team.");
                resetForm();
            } else {
                await updatePublicGood(project!.id, payload);
                toast.success("Project updated successfully!");
            }
            onSuccess();
            onClose();
        } catch {
            toast.error(mode === 'create'
                ? "Failed to submit project. Please try again."
                : "Failed to update project. Please try again."
            );
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setLogo(null);
        setLogoPreview("");
        setBanner(null);
        setBannerPreview("");
        setScreenshots([]);
        setScreenshotPreviews([]);
        setTechInput("");
        setActiveTab("project");
    };

    const tabs = ["project", "impact", "team", "support", "preview"];
    const currentIndex = tabs.indexOf(activeTab);

    const goNext = () => {
        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
    };

    const goPrevious = () => {
        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
    };

    const title = mode === 'create' ? "Submit Your Project" : "Edit Project";
    const subtitle = mode === 'create'
        ? "Submit your project to the HyperLiquid Public Goods program"
        : undefined;
    const submitLabel = mode === 'create' ? "Submit Project" : "Update Project";
    const submittingLabel = mode === 'create' ? "Submitting..." : "Updating...";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[900px] max-h-[90vh] bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20 flex flex-col"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-bold">{title}</DialogTitle>
                    {subtitle && (
                        <p className="text-text-secondary text-sm">{subtitle}</p>
                    )}
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-5 bg-black/20 border border-border-subtle rounded-lg p-1">
                        <TabsTrigger value="project" className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">
                            1. Project
                        </TabsTrigger>
                        <TabsTrigger value="impact" className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">
                            2. Impact
                        </TabsTrigger>
                        <TabsTrigger value="team" className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">
                            3. Team
                        </TabsTrigger>
                        <TabsTrigger value="support" className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">
                            4. Support
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">
                            5. Preview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="project" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <ProjectTab
                            formData={formData}
                            updateField={updateField}
                            logo={logo}
                            logoPreview={logoPreview}
                            handleLogoUpload={handleLogoUpload}
                            removeLogo={removeLogo}
                            banner={banner}
                            bannerPreview={bannerPreview}
                            handleBannerUpload={handleBannerUpload}
                            removeBanner={removeBanner}
                            screenshots={screenshots}
                            screenshotPreviews={screenshotPreviews}
                            handleScreenshotsUpload={handleScreenshotsUpload}
                            removeScreenshot={removeScreenshot}
                        />
                    </TabsContent>

                    <TabsContent value="impact" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <ImpactTab
                            formData={formData}
                            updateField={updateField}
                            toggleTargetUser={toggleTargetUser}
                        />
                    </TabsContent>

                    <TabsContent value="team" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <TeamTab
                            formData={formData}
                            updateField={updateField}
                            techInput={techInput}
                            setTechInput={setTechInput}
                            addTechnology={addTechnology}
                            removeTechnology={removeTechnology}
                        />
                    </TabsContent>

                    <TabsContent value="support" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <SupportTab
                            formData={formData}
                            updateField={updateField}
                            toggleSupportType={toggleSupportType}
                            toggleContributorType={toggleContributorType}
                        />
                    </TabsContent>

                    <TabsContent value="preview" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <PreviewTab formData={formData} />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-between pt-4 border-t border-border-subtle">
                    <Button
                        variant="outline"
                        onClick={goPrevious}
                        disabled={currentIndex === 0}
                        className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    {currentIndex < tabs.length - 1 ? (
                        <Button
                            onClick={goNext}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                        >
                            {isSubmitting ? submittingLabel : submitLabel}
                            <Check className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Convenience exports for backward compatibility
export function SubmitProjectModal(props: Omit<ProjectFormModalProps, 'mode' | 'project'>) {
    return <ProjectFormModal {...props} mode="create" />;
}

export function EditProjectModal(props: Omit<ProjectFormModalProps, 'mode'> & { project: PublicGood }) {
    return <ProjectFormModal {...props} mode="edit" project={props.project} />;
}
