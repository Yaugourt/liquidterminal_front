"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEducationalCategory, useCreateEducationalResource, useEducationalCategories, useCsvUpload } from "@/services/wiki";
import { EducationalCategory, EducationalResource } from "@/services/wiki/types";
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
          <Button className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#151A25] border border-white/10 rounded-2xl shadow-xl shadow-black/20 text-white max-w-md">
          <DialogTitle className="sr-only">Add Educational Content</DialogTitle>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#0A0D12] rounded-lg p-1 border border-white/5">
              <TabsTrigger 
                value="category" 
                className="text-zinc-400 data-[state=active]:bg-[#83E9FF] data-[state=active]:text-[#051728] data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Add Category
              </TabsTrigger>
              <TabsTrigger 
                value="resource" 
                className="text-zinc-400 data-[state=active]:bg-[#83E9FF] data-[state=active]:text-[#051728] data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Add Resource
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="text-zinc-400 data-[state=active]:bg-[#83E9FF] data-[state=active]:text-[#051728] data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Upload CSV
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="category" className="mt-6">
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="categoryName" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Category Name *</label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="categoryDesc" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Description</label>
                  <Textarea
                    id="categoryDesc"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50"
                    rows={3}
                    placeholder="Enter category description (optional)"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creatingCategory}
                    className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
                  >
                    {creatingCategory ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="resource" className="mt-6">
              <form onSubmit={handleResourceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resourceUrl" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Resource URL *</label>
                  <Input
                    id="resourceUrl"
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                    className="bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50"
                    placeholder="https://example.com/resource"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="resourceCategory" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Category *</label>
                  <Select
                    value={resourceForm.categoryId}
                    onValueChange={(value) => setResourceForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="bg-[#0A0D12] border-white/5 text-white rounded-lg">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151A25] border-white/10 rounded-xl">
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)} className="text-zinc-300 hover:bg-white/5 focus:bg-white/5 rounded-lg">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creatingResource}
                    className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
                  >
                    {creatingResource ? "Adding..." : "Add Resource"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="csv" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="csvFile" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">CSV File *</label>
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
                      className="w-full bg-[#0A0D12] border-white/5 text-white hover:bg-white/5 border-dashed border-2 py-8 rounded-xl"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-[#83E9FF]" />
                        <span className="text-sm">Click to select CSV file</span>
                        <span className="text-xs text-zinc-500">Max 10MB</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {uploadingCsv && (
                  <div className="flex items-center gap-2 text-[#83E9FF]">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#83E9FF]"></div>
                    <span className="text-sm">Upload en cours...</span>
                  </div>
                )}

                {csvError && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Erreur : {csvError}</span>
                  </div>
                )}

                {result?.success && (
                  <div className="space-y-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="font-medium">Import réussi !</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Total :</span>
                        <span className="text-[#83E9FF]">{result.data.totalRows}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Succès :</span>
                        <span className="text-emerald-400">{result.data.successfulImports}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Échecs :</span>
                        <span className="text-rose-400">{result.data.failedImports}</span>
                      </div>
                    </div>
                    
                    {result.data.createdCategories.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[#83E9FF]">Nouvelles catégories créées :</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.data.createdCategories.map((category, index) => (
                            <span key={index} className="bg-[#0A0D12] px-2 py-1 rounded-lg text-xs border border-white/5">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.data.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-amber-400">Erreurs rencontrées :</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {result.data.errors.map((error, index) => (
                            <div key={index} className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                              <div className="font-medium">Ligne {error.row} :</div>
                              <div>{error.error}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button
                        onClick={handleCsvSuccess}
                        className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
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