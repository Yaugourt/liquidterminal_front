"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { useCreateProject, useCreateCategory, useCategories, useCsvUploadProjects } from "@/services/project";
import { Project } from "@/services/project/types";
import { toast } from "sonner";
import { PiPlus, PiUpload, PiX } from "react-icons/pi";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface ProjectModalProps {
  onSuccess?: (project?: Project) => void;
}

export function ProjectModal({ onSuccess }: ProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("project");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    desc: "",
    logo: "",
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
    categoryIds: [] as number[]
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
          categoryIds: projectForm.categoryIds.length > 0 ? projectForm.categoryIds : undefined,
          twitter: projectForm.twitter || undefined,
          discord: projectForm.discord || undefined,
          telegram: projectForm.telegram || undefined,
          website: projectForm.website || undefined
        };
        
        newProject = await createProjectWithUpload(uploadData);
      } else {
        // Use existing API for URL-based logo (route: /project)

        const projectData = {
          ...projectForm,
          categoryIds: projectForm.categoryIds.length > 0 ? projectForm.categoryIds : undefined
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
        categoryIds: []
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black font-medium">
          <PiPlus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-[#0A1F32] border-[#1E3851] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Add Project</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-[#112941]">
            <TabsTrigger value="project" className="text-white data-[state=active]:text-[#F9E370]">Add Project</TabsTrigger>
            <TabsTrigger value="category" className="text-white data-[state=active]:text-[#F9E370]">Add Category</TabsTrigger>
            <TabsTrigger value="csv" className="text-white data-[state=active]:text-[#F9E370]">CSV Upload</TabsTrigger>
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
                  <label htmlFor="categories" className="text-white text-sm font-medium">Categories</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-[#112941] border border-[#1E3851] rounded-md p-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectForm.categoryIds.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProjectForm(prev => ({
                                ...prev,
                                categoryIds: [...prev.categoryIds, category.id]
                              }));
                            } else {
                              setProjectForm(prev => ({
                                ...prev,
                                categoryIds: prev.categoryIds.filter(id => id !== category.id)
                              }));
                            }
                          }}
                          className="rounded border-[#1E3851] text-[#83E9FF] focus:ring-[#83E9FF]"
                        />
                        <span className="text-white text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
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
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={80}
                        height={80}
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

          <TabsContent value="csv" className="space-y-4 mt-6 flex-1 overflow-y-auto min-h-0 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#83E9FF #112941'
          }}>
            <div className="space-y-4 pb-4">
              <div className="text-center">
                <div className="border-2 border-dashed border-[#1E3851] rounded-lg p-8 hover:border-[#83E9FF]/50 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-[#83E9FF] mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Upload Projects CSV</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Select a CSV file containing project data to bulk import
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileSelect}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCsv}
                    className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black"
                  >
                    {uploadingCsv ? "Uploading..." : "Choose CSV File"}
                  </Button>
                </div>
              </div>

              {/* Loading state */}
              {uploadingCsv && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-400">Processing CSV file...</p>
                </div>
              )}

              {/* Error state */}
              {csvError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <h4 className="text-sm font-medium text-red-400">Upload Failed</h4>
                  </div>
                  <p className="text-sm text-red-300">{csvError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetCsv}
                    className="mt-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Success state */}
              {result?.success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <h4 className="text-sm font-medium text-green-400">Upload Successful</h4>
                  </div>
                  
                  <div className="text-sm text-gray-300 space-y-1 mb-3">
                    <p>Total rows: {result.data.totalRows}</p>
                    <p>Successful imports: {result.data.successfulImports}</p>
                    <p>Failed imports: {result.data.failedImports}</p>
                    {result.data.createdCategories.length > 0 && (
                      <p>Created categories: {result.data.createdCategories.join(', ')}</p>
                    )}
                  </div>

                  {result.data.errors.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-yellow-400 mb-2">Errors:</h5>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.data.errors.map((error, index) => (
                          <p key={index} className="text-xs text-yellow-300">
                            Row {error.row}: {error.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      onClick={handleCsvSuccess}
                      className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-black"
                    >
                      Done
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetCsv}
                      className="border-[#1E3851] text-white hover:bg-[#112941]"
                    >
                      Upload Another
                    </Button>
                  </div>
                </div>
              )}

              {/* CSV Format Info */}
              <div className="bg-[#112941]/50 border border-[#1E3851] rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">CSV Format</h4>
                <p className="text-xs text-gray-400 mb-2">
                  Your CSV file should contain the following columns:
                </p>
                <div className="text-xs text-gray-300 space-y-1">
                  <p><strong>title</strong> (required) - Project title</p>
                  <p><strong>desc</strong> (required) - Project description</p>
                  <p><strong>logo</strong> (required) - Logo URL</p>
                  <p><strong>category</strong> (optional) - Category name</p>
                  <p><strong>twitter</strong> (optional) - Twitter URL</p>
                  <p><strong>discord</strong> (optional) - Discord URL</p>
                  <p><strong>telegram</strong> (optional) - Telegram URL</p>
                  <p><strong>website</strong> (optional) - Website URL</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 