"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCreateProject, useCreateCategory, useCategories, useCsvUploadProjects } from "@/services/ecosystem/project";
import { Project } from "@/services/ecosystem/project/types";
import { toast } from "sonner";
import { PiPlus } from "react-icons/pi";
import { ProjectForm, CategoryForm, CsvUpload } from "./modal";

interface ProjectModalProps {
  onSuccess?: (project?: Project) => void;
}

export function ProjectModal({ onSuccess }: ProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("project");
  
  // Form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    desc: "",
    logo: "",
    banner: "",
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
    token: "",
    categoryIds: [] as number[]
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });

  // Hooks
  const { createProject, createProjectWithUpload, isLoading: creatingProject } = useCreateProject();
  const { createCategory, isLoading: creatingCategory } = useCreateCategory();
  const { categories, refetch: refetchCategories } = useCategories();
  const { uploadFile, result, loading: uploadingCsv, error: csvError, reset: resetCsv } = useCsvUploadProjects();

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setProjectForm(prev => ({ ...prev, logo: "" })); // Clear URL if file is selected
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setLogoPreview("");
    if (selectedFile) {
      URL.revokeObjectURL(logoPreview);
    }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setProjectForm(prev => ({ ...prev, banner: "" })); // Clear URL if file is selected
    }
  };

  const handleRemoveBannerFile = () => {
    setSelectedBannerFile(null);
    setBannerPreview("");
    if (selectedBannerFile) {
      URL.revokeObjectURL(bannerPreview);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: either file or URL must be provided
    const hasFile = selectedFile !== null;
    const hasUrl = projectForm.logo.trim() !== '';
    
    if (!hasFile && !hasUrl) {
      toast.error("Please provide either a logo file or URL");
      return;
    }
    
    if (hasFile && hasUrl) {
      toast.warning("Both file and URL provided. File upload will be used.");
    }
    
    try {
      let newProject: Project | null = null;
      
      if (selectedFile) {
        // Upload file using the new API (route: /project/with-upload)

        
        const uploadData = {
          title: projectForm.title,
          desc: projectForm.desc,
          logo: selectedFile,
          banner: selectedBannerFile || undefined,
          categoryIds: projectForm.categoryIds.length > 0 ? projectForm.categoryIds : undefined,
          twitter: projectForm.twitter || undefined,
          discord: projectForm.discord || undefined,
          telegram: projectForm.telegram || undefined,
          website: projectForm.website || undefined,
          token: projectForm.token || undefined
        };
        
        newProject = await createProjectWithUpload(uploadData);
      } else {
        // Use existing API for URL-based logo (route: /project)

        const projectData = {
          ...projectForm,
          banner: projectForm.banner || undefined,
          token: projectForm.token || undefined,
          categoryIds: projectForm.categoryIds.length > 0 ? projectForm.categoryIds : undefined
        };
        
        newProject = await createProject(projectData);
      }
      
      toast.success("Project created successfully!");
      setProjectForm({
        title: "",
        desc: "",
        logo: "",
        banner: "",
        twitter: "",
        discord: "",
        telegram: "",
        website: "",
        token: "",
        categoryIds: []
      });
      setSelectedFile(null);
      setLogoPreview("");
      setSelectedBannerFile(null);
      setBannerPreview("");
      setOpen(false);
      onSuccess?.(newProject || undefined);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCategory(categoryForm);
      toast.success("Category created successfully!");
      setCategoryForm({ name: "", description: "" });
      setActiveTab("project"); // Switch back to project tab
      // Recharger les catégories pour mettre à jour les tabs
      await refetchCategories();
      onSuccess?.();
    } catch {
      toast.error("Failed to create category");
    }
  };

  // CSV upload functions
  const handleCsvFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    await uploadFile(file);
  };

  const handleCsvSuccess = () => {
    if (result?.success && onSuccess) {
      onSuccess();
    }
    resetCsv();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg">
          <PiPlus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-brand-secondary border border-white/10 rounded-2xl shadow-xl shadow-black/20 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-bold">Add Project</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-brand-dark border border-white/5 rounded-lg p-1">
            <TabsTrigger value="project" className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">Add Project</TabsTrigger>
            <TabsTrigger value="category" className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">Add Category</TabsTrigger>
            <TabsTrigger value="csv" className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all">CSV Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="project" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}>
            <ProjectForm
              projectForm={projectForm}
              setProjectForm={setProjectForm}
              categories={categories}
              selectedFile={selectedFile}
              logoPreview={logoPreview}
              handleFileSelect={handleFileSelect}
              handleRemoveFile={handleRemoveFile}
              selectedBannerFile={selectedBannerFile}
              bannerPreview={bannerPreview}
              handleBannerFileSelect={handleBannerFileSelect}
              handleRemoveBannerFile={handleRemoveBannerFile}
              handleProjectSubmit={handleProjectSubmit}
              creatingProject={creatingProject}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>
          
          <TabsContent value="category" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}>
            <CategoryForm
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              handleCategorySubmit={handleCategorySubmit}
              creatingCategory={creatingCategory}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="csv" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}>
            <CsvUpload
              uploadingCsv={uploadingCsv}
              csvError={csvError}
              result={result}
              handleCsvFileSelect={handleCsvFileSelect}
              handleCsvSuccess={handleCsvSuccess}
              resetCsv={resetCsv}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 