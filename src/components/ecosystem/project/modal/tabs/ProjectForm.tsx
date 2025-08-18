"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PiUpload, PiX } from "react-icons/pi";
import { Category } from "@/services/ecosystem/project/types";

interface ProjectFormData {
  title: string;
  desc: string;
  logo: string;
  twitter: string;
  discord: string;
  telegram: string;
  website: string;
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
  handleProjectSubmit,
  creatingProject,
  onCancel
}: ProjectFormProps) {
  return (
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
          onClick={onCancel}
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
  );
}
