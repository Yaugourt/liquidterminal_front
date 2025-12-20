"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import {
  validatePublicGoodForm,
} from "@/lib/publicgoods-helpers";
import { useUpdatePublicGood, PublicGood } from "@/services/ecosystem/publicgood";
import { ProjectTab, ImpactTab, TeamTab, SupportTab, PreviewTab } from "./modal";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: PublicGood;
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

export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [activeTab, setActiveTab] = useState("project");
  const { updatePublicGood, isLoading: isSubmitting } = useUpdatePublicGood();
  
  const [formData, setFormData] = useState<FormData>({
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
  });
  
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // Pre-fill form with project data
  useEffect(() => {
    if (project) {
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

      // Set image previews from existing URLs
      if (project.logo) setLogoPreview(project.logo);
      if (project.banner) setBannerPreview(project.banner);
      if (project.screenshots && project.screenshots.length > 0) {
        setScreenshotPreviews(project.screenshots);
      }
    }
  }, [project]);

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview("");
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBanner(null);
    setBannerPreview("");
  };

  const handleScreenshotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
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
    
    try {
      await updatePublicGood(project.id, {
        // Section 1
        name: formData.name,
        description: formData.description,
        githubUrl: formData.githubUrl,
        demoUrl: formData.demoUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        category: formData.category,
        discordContact: formData.discordContact || undefined,
        telegramContact: formData.telegramContact || undefined,
        // Section 2
        problemSolved: formData.problemSolved,
        targetUsers: formData.targetUsers,
        hlIntegration: formData.hlIntegration,
        developmentStatus: formData.developmentStatus as 'IDEA' | 'DEVELOPMENT' | 'BETA' | 'PRODUCTION',
        // Section 3
        leadDeveloperName: formData.leadDeveloperName,
        leadDeveloperContact: formData.leadDeveloperContact,
        teamSize: formData.teamSize as 'SOLO' | 'SMALL' | 'LARGE',
        experienceLevel: formData.experienceLevel as 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT',
        technologies: formData.technologies,
        // Section 4
        supportTypes: formData.supportTypes.length > 0 ? formData.supportTypes as ('PROMOTION' | 'SERVICES' | 'FUNDING' | 'CONTRIBUTOR')[] : undefined,
        contributorTypes: formData.contributorTypes.length > 0 ? formData.contributorTypes as ('DEVELOPERS' | 'DESIGNERS' | 'MARKETING_COMMUNITY' | 'TECHNICAL_WRITERS' | 'QA_TESTERS')[] : undefined,
        budgetRange: formData.budgetRange ? formData.budgetRange as 'RANGE_0_5K' | 'RANGE_5_15K' | 'RANGE_15_30K' | 'RANGE_30_50K' | 'RANGE_50K_PLUS' : undefined,
        // Files (only if changed)
        logo: logo || undefined,
        banner: banner || undefined,
        screenshots: screenshots.length > 0 ? screenshots : undefined
      });
      
      toast.success("Project updated successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update project. Please try again.");
    }
  };

  const tabs = [
    { id: "project", label: "Project" },
    { id: "impact", label: "Impact" },
    { id: "team", label: "Team" },
    { id: "support", label: "Support" },
    { id: "preview", label: "Preview" }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isLastTab = currentTabIndex === tabs.length - 1;
  const isFirstTab = currentTabIndex === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Project</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-brand-dark border border-border-subtle rounded-lg p-1">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-text-secondary data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="project" className="space-y-4 mt-6">
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

          <TabsContent value="impact" className="space-y-4 mt-6">
            <ImpactTab
              formData={formData}
              updateField={updateField}
              toggleTargetUser={toggleTargetUser}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-6">
            <TeamTab
              formData={formData}
              updateField={updateField}
              techInput={techInput}
              setTechInput={setTechInput}
              addTechnology={addTechnology}
              removeTechnology={removeTechnology}
            />
          </TabsContent>

          <TabsContent value="support" className="space-y-4 mt-6">
            <SupportTab
              formData={formData}
              updateField={updateField}
              toggleSupportType={toggleSupportType}
              toggleContributorType={toggleContributorType}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-6">
            <PreviewTab
              formData={formData}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border-subtle">
          <Button
            variant="outline"
            onClick={() => {
              if (isFirstTab) {
                onClose();
              } else {
                setActiveTab(tabs[currentTabIndex - 1].id);
              }
            }}
            className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFirstTab ? "Cancel" : "Previous"}
          </Button>

          <Button
            onClick={() => {
              if (isLastTab) {
                handleSubmit();
              } else {
                setActiveTab(tabs[currentTabIndex + 1].id);
              }
            }}
            disabled={isSubmitting}
            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
          >
            {isSubmitting ? (
              "Updating..."
            ) : isLastTab ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Update Project
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

