"use client";

import { useState } from "react";
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
import { useCreatePublicGood } from "@/services/ecosystem/publicgood";
import { ProjectTab, ImpactTab, TeamTab, SupportTab, PreviewTab } from "./modal";

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  budgetRange: string;
  timeline: string;
}

export function SubmitProjectModal({ isOpen, onClose, onSuccess }: SubmitProjectModalProps) {
  const [activeTab, setActiveTab] = useState("project");
  const { createPublicGood, isLoading: isSubmitting } = useCreatePublicGood();
  
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
    budgetRange: "",
    timeline: ""
  });
  
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  
  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 2);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogo(null);
    setLogoPreview("");
  };
  
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  
  const removeBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBanner(null);
    setBannerPreview("");
  };
  
  const handleScreenshotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
  };
  
  const removeScreenshot = (index: number) => {
    URL.revokeObjectURL(screenshotPreviews[index]);
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
      await createPublicGood({
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
        supportTypes: formData.supportTypes.length > 0 ? formData.supportTypes as ('PROMOTION' | 'SERVICES' | 'FUNDING')[] : undefined,
        budgetRange: formData.budgetRange ? formData.budgetRange as 'RANGE_0_5K' | 'RANGE_5_15K' | 'RANGE_15_30K' | 'RANGE_30_50K' | 'RANGE_50K_PLUS' : undefined,
        timeline: formData.timeline ? formData.timeline as 'THREE_MONTHS' | 'SIX_MONTHS' | 'TWELVE_MONTHS' : undefined,
        // Files
        logo: logo || undefined,
        banner: banner || undefined,
        screenshots: screenshots.length > 0 ? screenshots : undefined
      });
      
      toast.success("Project submitted successfully! It will be reviewed by our team.");
      resetForm();
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to submit project. Please try again.");
    }
  };
  
  const resetForm = () => {
    setFormData({
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
      budgetRange: "",
      timeline: ""
    });
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-[#0A1F32] border-[#1E3851] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Submit Your Project</DialogTitle>
          <p className="text-gray-400 text-sm">
            Submit your project to the HyperLiquid Public Goods program
          </p>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-5 bg-[#112941]">
            <TabsTrigger value="project" className="text-white data-[state=active]:text-[#83E9FF]">
              1. Project
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-white data-[state=active]:text-[#83E9FF]">
              2. Impact
            </TabsTrigger>
            <TabsTrigger value="team" className="text-white data-[state=active]:text-[#83E9FF]">
              3. Team
            </TabsTrigger>
            <TabsTrigger value="support" className="text-white data-[state=active]:text-[#83E9FF]">
              4. Support
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-white data-[state=active]:text-[#83E9FF]">
              5. Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="project" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6">
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
          
          <TabsContent value="impact" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6">
            <ImpactTab
              formData={formData}
              updateField={updateField}
              toggleTargetUser={toggleTargetUser}
            />
          </TabsContent>
          
          <TabsContent value="team" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6">
            <TeamTab
              formData={formData}
              updateField={updateField}
              techInput={techInput}
              setTechInput={setTechInput}
              addTechnology={addTechnology}
              removeTechnology={removeTechnology}
            />
          </TabsContent>
          
          <TabsContent value="support" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6">
            <SupportTab
              formData={formData}
              updateField={updateField}
              toggleSupportType={toggleSupportType}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 overflow-y-auto space-y-4 pr-2 mt-6">
            <PreviewTab formData={formData} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between pt-4 border-t border-[#1E3851]">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="border-[#1E3851] text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentIndex < tabs.length - 1 ? (
            <Button
              onClick={goNext}
              className="bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Project"}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
