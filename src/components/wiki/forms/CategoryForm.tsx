"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEducationalCategory } from "@/services/wiki";
import { EducationalCategory } from "@/services/wiki/types";

interface CategoryFormProps {
    onSuccess: (category: EducationalCategory) => void;
    onCancel: () => void;
}

export function CategoryForm({ onSuccess, onCancel }: CategoryFormProps) {
    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const { createCategory, isLoading } = useCreateEducationalCategory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        try {
            const newCategory = await createCategory({
                name: form.name,
                description: form.description || undefined
            });

            if (newCategory) {
                setForm({ name: "", description: "" });
                onSuccess(newCategory.data);
            }
        } catch {
            // Error handled silently
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="categoryName" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Category Name *</label>
                <Input
                    id="categoryName"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
                    placeholder="Enter category name"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="categoryDesc" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Description</label>
                <Textarea
                    id="categoryDesc"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
                    rows={3}
                    placeholder="Enter category description (optional)"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                >
                    {isLoading ? "Adding..." : "Add Category"}
                </Button>
            </div>
        </form>
    );
}
