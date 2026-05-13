"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormProps {
  /** Controlled form state owned by the parent. */
  value: CategoryFormData;
  /** Setter — receives the next state (typed for both `setState(next)` and `setState(prev => ...)`). */
  onChange: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  /** Submit handler — the parent is responsible for the API call. */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  /** Cancel handler (closes the modal, etc.). */
  onCancel: () => void;
  /** Submit-in-flight flag. Disables the submit button. */
  isSubmitting?: boolean;
  /** Submit button label (idle state). */
  submitLabel?: string;
  /** Submit button label while `isSubmitting` is true. */
  submittingLabel?: string;
  /** Optional placeholder for the name field. */
  namePlaceholder?: string;
  /** Optional placeholder for the description field. */
  descriptionPlaceholder?: string;
}

/**
 * Presentational form for creating a category (name + description).
 *
 * Used by the wiki Education modal and the ecosystem Project modal. The
 * markup is identical in both places — the parent owns state and the API
 * call, this component only renders.
 */
export function CategoryForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Add Category",
  submittingLabel = "Adding...",
  namePlaceholder = "Enter category name",
  descriptionPlaceholder = "Enter category description (optional)",
}: CategoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="categoryName" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
          Category Name *
        </label>
        <Input
          id="categoryName"
          value={value.name}
          onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
          className="bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
          placeholder={namePlaceholder}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryDesc" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
          Description
        </label>
        <Textarea
          id="categoryDesc"
          value={value.description}
          onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          className="bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
          rows={3}
          placeholder={descriptionPlaceholder}
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
          disabled={isSubmitting}
          className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
