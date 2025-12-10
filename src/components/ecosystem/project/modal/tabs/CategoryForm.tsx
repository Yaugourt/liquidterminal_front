"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormProps {
  categoryForm: CategoryFormData;
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  handleCategorySubmit: (e: React.FormEvent) => void;
  creatingCategory: boolean;
  onCancel: () => void;
}

export function CategoryForm({
  categoryForm,
  setCategoryForm,
  handleCategorySubmit,
  creatingCategory,
  onCancel
}: CategoryFormProps) {
  return (
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
          onClick={onCancel}
          className="border-[#1E3851] text-white hover:bg-[#112941]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={creatingCategory}
          className="bg-brand-accent hover:bg-brand-accent/90 text-black"
        >
          {creatingCategory ? "Creating..." : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
