"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEducationalResource, useEducationalCategories } from "@/services/wiki";
import { EducationalResource } from "@/services/wiki/types";

interface ResourceFormProps {
    onSuccess: (resource: EducationalResource) => void;
    onCancel: () => void;
}

export function ResourceForm({ onSuccess, onCancel }: ResourceFormProps) {
    const [form, setForm] = useState({
        url: "",
        categoryId: ""
    });

    const { createResource, isLoading } = useCreateEducationalResource();
    const { categories } = useEducationalCategories();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.categoryId) return;
        if (!form.url || !form.url.startsWith("https://")) return;

        try {
            const newResource = await createResource({
                url: form.url,
                categoryIds: [parseInt(form.categoryId)]
            });

            if (newResource) {
                setForm({ url: "", categoryId: "" });
                onSuccess(newResource.data);
            }
        } catch {
            // Error handled silently
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="resourceUrl" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Resource URL *</label>
                <Input
                    id="resourceUrl"
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                    className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
                    placeholder="https://example.com/resource"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="resourceCategory" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Category *</label>
                <Select
                    value={form.categoryId}
                    onValueChange={(value) => setForm(prev => ({ ...prev, categoryId: value }))}
                >
                    <SelectTrigger className="bg-brand-dark border-white/5 text-white rounded-lg">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-secondary border-white/10 rounded-xl">
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
                    {isLoading ? "Adding..." : "Add Resource"}
                </Button>
            </div>
        </form>
    );
}
