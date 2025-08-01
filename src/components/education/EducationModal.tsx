"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEducationalCategory, useCreateEducationalResource, useEducationalCategories } from "@/services/education";
import { EducationalCategory, EducationalResource } from "@/services/education/types";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { Plus } from "lucide-react";

interface EducationModalProps {
  onSuccess?: (item?: EducationalCategory | EducationalResource) => void;
}

export function EducationModal({ onSuccess }: EducationModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  
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
        
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#112941]">
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
          </Tabs>
        </DialogContent>
      </Dialog>
    </ProtectedAction>
  );
} 