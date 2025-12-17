"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { Category } from "@/services/ecosystem/project/types";

interface ProjectFormData {
  title: string;
  desc: string;
  logo: string;
  banner: string;
  twitter: string;
  discord: string;
  telegram: string;
  website: string;
  token: string;
  categoryIds: number[];
}

interface ProjectFormProps {
  projectForm: ProjectFormData;
  setProjectForm: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  categories: Category[];
  selectedFile: File | null;
  logoPreview: string;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  selectedBannerFile: File | null;
  bannerPreview: string;
  handleBannerFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveBannerFile: () => void;
  handleProjectSubmit: (e: React.FormEvent) => void;
  creatingProject: boolean;
  onCancel: () => void;
}

export function ProjectForm({
  projectForm,
  setProjectForm,
  categories,
  selectedFile,
  logoPreview,
  handleFileSelect,
  handleRemoveFile,
  selectedBannerFile,
  bannerPreview,
  handleBannerFileSelect,
  handleRemoveBannerFile,
  handleProjectSubmit,
  creatingProject,
  onCancel
}: ProjectFormProps) {
  return (
    <form onSubmit={handleProjectSubmit} className="space-y-4 pb-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Title *</label>
          <Input
            id="title"
            value={projectForm.title}
            onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
            className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="categories" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Categories</label>
          <div className="space-y-2 max-h-32 overflow-y-auto bg-brand-dark border border-white/5 rounded-lg p-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-1 rounded">
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
                  className="rounded border-white/10 bg-brand-dark text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-zinc-300 text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="desc" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Description *</label>
        <Textarea
          id="desc"
          value={projectForm.desc}
          onChange={(e) => setProjectForm(prev => ({ ...prev, desc: e.target.value }))}
          className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Logo *</label>

        {/* File Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border border-white/5 rounded-lg bg-brand-dark text-white hover:bg-white/5 transition-colors">
                <Upload className="h-4 w-4 text-brand-accent" />
                <span className="text-sm">Upload Image</span>
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
                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {/* Preview */}
          {logoPreview && (
            <div className="relative w-20 h-20 border border-white/10 rounded-xl overflow-hidden">
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
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-zinc-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="logo-url" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Logo URL</label>
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
              className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50 mt-1"
              placeholder="https://example.com/logo.png"
              disabled={!!selectedFile}
            />
          </div>
        </div>
      </div>

      {/* Banner (optional) */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Banner (optional)</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="banner-file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border border-white/5 rounded-lg bg-brand-dark text-white hover:bg-white/5 transition-colors">
                <Upload className="h-4 w-4 text-brand-accent" />
                <span className="text-sm">Upload Banner</span>
              </div>
              <input
                id="banner-file-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerFileSelect}
                className="hidden"
              />
            </label>

            {selectedBannerFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveBannerFile}
                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {/* Preview */}
          {bannerPreview && (
            <div className="relative w-full max-w-md h-24 border border-white/10 rounded-xl overflow-hidden">
              <Image
                src={bannerPreview}
                alt="Banner preview"
                width={640}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* OR separator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-zinc-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="banner-url" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Banner URL</label>
            <Input
              id="banner-url"
              type="url"
              value={projectForm.banner}
              onChange={(e) => {
                setProjectForm(prev => ({ ...prev, banner: e.target.value }));
                if (selectedBannerFile) {
                  handleRemoveBannerFile();
                }
              }}
              className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50 mt-1"
              placeholder="https://example.com/banner.png"
              disabled={!!selectedBannerFile}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="website" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Website</label>
          <Input
            id="website"
            type="url"
            value={projectForm.website}
            onChange={(e) => setProjectForm(prev => ({ ...prev, website: e.target.value }))}
            className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="twitter" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Twitter</label>
          <Input
            id="twitter"
            type="url"
            value={projectForm.twitter}
            onChange={(e) => setProjectForm(prev => ({ ...prev, twitter: e.target.value }))}
            className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
            placeholder="https://twitter.com/project"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="discord" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Discord</label>
          <Input
            id="discord"
            type="url"
            value={projectForm.discord}
            onChange={(e) => setProjectForm(prev => ({ ...prev, discord: e.target.value }))}
            className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
            placeholder="https://discord.gg/project"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="telegram" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Telegram</label>
          <Input
            id="telegram"
            type="url"
            value={projectForm.telegram}
            onChange={(e) => setProjectForm(prev => ({ ...prev, telegram: e.target.value }))}
            className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
            placeholder="https://t.me/project"
          />
        </div>
      </div>

      {/* Token Address (optional) */}
      <div className="space-y-2">
        <label htmlFor="token" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Token Address (optional)</label>
        <Input
          id="token"
          type="text"
          value={projectForm.token}
          onChange={(e) => setProjectForm(prev => ({ ...prev, token: e.target.value }))}
          className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
          placeholder="0x..."
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
          disabled={creatingProject}
          className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
        >
          {creatingProject ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
