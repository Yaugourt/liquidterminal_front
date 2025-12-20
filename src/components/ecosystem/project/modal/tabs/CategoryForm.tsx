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
        <label htmlFor="categoryName" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Category Name *</label>
        <Input
          id="categoryName"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
          className="bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryDesc" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Description</label>
        <Textarea
          id="categoryDesc"
          value={categoryForm.description}
          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
          className="bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
          rows={3}
          placeholder="Optional description for the category"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={creatingCategory}
          className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
        >
          {creatingCategory ? "Creating..." : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
