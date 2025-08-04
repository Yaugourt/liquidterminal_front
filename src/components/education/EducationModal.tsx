"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEducationalCategory, useCreateEducationalResource, useEducationalCategories, useCsvUpload } from "@/services/education";
import { EducationalCategory, EducationalResource } from "@/services/education/types";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { Plus, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface EducationModalProps {
  onSuccess?: (item?: EducationalCategory | EducationalResource) => void;
}

export function EducationModal({ onSuccess }: EducationModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });
  
  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    url: "",
    categoryId: ""
  });
  
  // Hooks
  const { createCategory, isLoading: creatingCategory } = useCreateEducationalCategory();
  const { createResource, isLoading: creatingResource } = useCreateEducationalResource();
  const { categories } = useEducationalCategories();
  const { uploadFile, result, loading: uploadingCsv, error: csvError, reset: resetCsv } = useCsvUpload();
  const { user } = useAuthContext();

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      return;
    }
    
    try {
      const newCategory = await createCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined
      });
      
      if (newCategory) {
        setCategoryForm({ name: "", description: "" });
        setOpen(false);
        onSuccess?.(newCategory.data);
      }
    } catch {
      // Error handled silently
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.categoryId) {
      return;
    }
    if (!resourceForm.url || !resourceForm.url.startsWith("https://")) {
      return;
    }
    
    try {
      const newResource = await createResource({
        url: resourceForm.url,
        categoryIds: [parseInt(resourceForm.categoryId)]
      });
      
      if (newResource) {
        setResourceForm({ url: "", categoryId: "" });
        setOpen(false);
        onSuccess?.(newResource.data);
      }
    } catch {
      // Error handled silently
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Veuillez sélectionner un fichier CSV');
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
    <ProtectedAction requiredRole="MODERATOR" user={user}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#051728] border-[#83E9FF] text-white max-w-md">
          <DialogTitle className="sr-only">Add Educational Content</DialogTitle>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#112941]">
              <TabsTrigger 
                value="category" 
                className="text-white data-[state=active]:text-[#F9E370] data-[state=active]:bg-[#112941]"
              >
                Add Category
              </TabsTrigger>
              <TabsTrigger 
                value="resource" 
                className="text-white data-[state=active]:text-[#F9E370] data-[state=active]:bg-[#112941]"
              >
                Add Resource
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="text-white data-[state=active]:text-[#F9E370] data-[state=active]:bg-[#112941]"
              >
                Upload CSV
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="category" className="mt-6">
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="categoryName" className="text-white text-sm font-medium">Category Name *</label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="Enter category name"
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
                    placeholder="Enter category description (optional)"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-[#83E9FF4D] hover:border-[#83E9FF80] text-white hover:bg-[#83E9FF20]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creatingCategory}
                    className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
                  >
                    {creatingCategory ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="resource" className="mt-6">
              <form onSubmit={handleResourceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resourceUrl" className="text-white text-sm font-medium">Resource URL *</label>
                  <Input
                    id="resourceUrl"
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                    className="bg-[#112941] border-[#1E3851] text-white"
                    placeholder="https://example.com/resource"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="resourceCategory" className="text-white text-sm font-medium">Category *</label>
                  <Select
                    value={resourceForm.categoryId}
                    onValueChange={(value) => setResourceForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#112941] border-[#1E3851]">
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)} className="text-white hover:bg-[#1E3851]">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-[#83E9FF4D] hover:border-[#83E9FF80] text-white hover:bg-[#83E9FF20]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creatingResource}
                    className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
                  >
                    {creatingResource ? "Adding..." : "Add Resource"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="csv" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="csvFile" className="text-white text-sm font-medium">CSV File *</label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      disabled={uploadingCsv}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCsv}
                      className="w-full bg-[#112941] border-[#1E3851] text-white hover:bg-[#1E3851] border-dashed border-2 py-8"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6" />
                        <span>Click to select CSV file</span>
                        <span className="text-xs text-gray-400">Max 10MB</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {uploadingCsv && (
                  <div className="flex items-center gap-2 text-[#83E9FF]">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#83E9FF]"></div>
                    <span>Upload en cours...</span>
                  </div>
                )}

                {csvError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>Erreur : {csvError}</span>
                  </div>
                )}

                {result?.success && (
                  <div className="space-y-4 bg-green-900/20 p-4 rounded border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="font-medium">Import réussi !</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total :</span>
                        <span className="text-[#83E9FF]">{result.data.totalRows}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Succès :</span>
                        <span className="text-green-400">{result.data.successfulImports}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échecs :</span>
                        <span className="text-red-400">{result.data.failedImports}</span>
                      </div>
                    </div>
                    
                    {result.data.createdCategories.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[#83E9FF]">Nouvelles catégories créées :</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.data.createdCategories.map((category, index) => (
                            <span key={index} className="bg-[#112941] px-2 py-1 rounded text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.data.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-yellow-400">Erreurs rencontrées :</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {result.data.errors.map((error, index) => (
                            <div key={index} className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded">
                              <div className="font-medium">Ligne {error.row} :</div>
                              <div>{error.error}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        onClick={handleCsvSuccess}
                        className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-[#83E9FF4D] hover:border-[#83E9FF80] text-white hover:bg-[#83E9FF20]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </ProtectedAction>
  );
} 