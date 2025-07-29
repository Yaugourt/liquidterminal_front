"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProject, useCreateCategory, useCategories } from "@/services/project";
import { Project } from "@/services/project/types";
import { toast } from "sonner";
import { PiPlus, PiUpload, PiX } from "react-icons/pi";

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
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
    categoryId: ""
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });

  // Hooks
  const { createProject, createProjectWithUpload, isLoading: creatingProject } = useCreateProject();
  const { createCategory, isLoading: creatingCategory } = useCreateCategory();
  const { categories } = useCategories();

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
        console.log('Using file upload route with file:', selectedFile.name);
        console.log('Form data being sent:', {
          title: projectForm.title,
          desc: projectForm.desc,
          categoryId: projectForm.categoryId
        });
        
        const uploadData = {
          title: projectForm.title,
          desc: projectForm.desc,
          logo: selectedFile,
          categoryId: projectForm.categoryId ? parseInt(projectForm.categoryId) : undefined,
          twitter: projectForm.twitter || undefined,
          discord: projectForm.discord || undefined,
          telegram: projectForm.telegram || undefined,
          website: projectForm.website || undefined
        };
        
        newProject = await createProjectWithUpload(uploadData);
      } else {
        // Use existing API for URL-based logo (route: /project)
        console.log('Using URL route with logo URL:', projectForm.logo);
        const projectData = {
          ...projectForm,
          categoryId: projectForm.categoryId ? parseInt(projectForm.categoryId) : undefined
        };
        
        newProject = await createProject(projectData);
      }
      
      toast.success("Project created successfully!");
      setProjectForm({
        title: "",
        desc: "",
        logo: "",
        twitter: "",
        discord: "",
        telegram: "",
        website: "",
        categoryId: ""
      });
      setSelectedFile(null);
      setLogoPreview("");
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
      onSuccess?.();
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black font-medium">
          <PiPlus className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-[#0A1F32] border-[#1E3851] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Project Page</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 bg-[#112941]">
            <TabsTrigger value="project" className="text-white data-[state=active]:text-[#F9E370]">Add Project</TabsTrigger>
            <TabsTrigger value="category" className="text-white data-[state=active]:text-[#F9E370] ">Add Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="project" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#83E9FF #112941'
          }}>
            <form onSubmit={handleProjectSubmit} className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-white text-sm font-medium">Title *</label>
                  <Input
                    id="title"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-white text-sm font-medium">Category</label>
                  <Select
                    value={projectForm.categoryId}
                    onValueChange={(value) => setProjectForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#112941] border-[#1E3851]">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="desc" className="text-white text-sm font-medium">Description *</label>
                <Textarea
                  id="desc"
                  value={projectForm.desc}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, desc: e.target.value }))}
                  className="bg-[#112941] border-[#1E3851] text-white"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Logo *</label>
                
                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-[#1E3851] rounded-lg bg-[#112941] text-white hover:bg-[#1E3851] transition-colors">
                        <PiUpload className="h-4 w-4" />
                        <span>Upload Image</span>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <PiX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {/* Preview */}
                  {logoPreview && (
                    <div className="relative w-20 h-20 border border-[#1E3851] rounded-lg overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* OR separator */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#1E3851]"></div>
                    <span className="text-gray-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-[#1E3851]"></div>
                  </div>
                  
                  {/* URL Input */}
                  <div>
                    <label htmlFor="logo-url" className="text-white text-sm font-medium">Logo URL</label>
                    <Input
                      id="logo-url"
                      type="url"
                      value={projectForm.logo}
                      onChange={(e) => {
                        setProjectForm(prev => ({ ...prev, logo: e.target.value }));
                        if (selectedFile) {
                          handleRemoveFile();
                        }
                      }}
                      className="bg-[#112941] border-[#1E3851] text-white"
                      placeholder="https://example.com/logo.png"
                      disabled={!!selectedFile}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="website" className="text-white text-sm font-medium">Website</label>
                  <Input
                    id="website"
                    type="url"
                    value={projectForm.website}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="twitter" className="text-white text-sm font-medium">Twitter</label>
                  <Input
                    id="twitter"
                    type="url"
                    value={projectForm.twitter}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, twitter: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="https://twitter.com/project"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="discord" className="text-white text-sm font-medium">Discord</label>
                  <Input
                    id="discord"
                    type="url"
                    value={projectForm.discord}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, discord: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="https://discord.gg/project"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="telegram" className="text-white text-sm font-medium">Telegram</label>
                  <Input
                    id="telegram"
                    type="url"
                    value={projectForm.telegram}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, telegram: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="https://t.me/project"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[#1E3851] text-white hover:bg-[#112941]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingProject}
                  className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black"
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="category" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#83E9FF #112941'
          }}>
            <form onSubmit={handleCategorySubmit} className="space-y-4 pb-4">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-white text-sm font-medium">Category Name *</label>
                <Input
                  id="categoryName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#112941] border-[#1E3851] text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="categoryDesc" className="text-white text-sm font-medium">Description</label>
                <Textarea
                  id="categoryDesc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-[#112941] border-[#1E3851] text-white"
                  rows={3}
                  placeholder="Optional description for the category"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[#1E3851] text-white hover:bg-[#112941]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingCategory}
                  className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black"
                >
                  {creatingCategory ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 