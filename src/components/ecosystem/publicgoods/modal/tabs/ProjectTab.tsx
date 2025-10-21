import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { CATEGORIES } from "@/lib/publicgoods-helpers";

interface ProjectTabProps {
  formData: {
    name: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    websiteUrl: string;
    category: string;
    discordContact: string;
    telegramContact: string;
  };
  updateField: (field: string, value: string) => void;
  logo: File | null;
  logoPreview: string;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  banner: File | null;
  bannerPreview: string;
  handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeBanner: () => void;
  screenshots: File[];
  screenshotPreviews: string[];
  handleScreenshotsUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeScreenshot: (index: number) => void;
}

export function ProjectTab({
  formData,
  updateField,
  logoPreview,
  handleLogoUpload,
  removeLogo,
  bannerPreview,
  handleBannerUpload,
  removeBanner,
  screenshotPreviews,
  handleScreenshotsUpload,
  removeScreenshot
}: ProjectTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Project Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="My Awesome HyperLiquid Tool"
          className="bg-[#112941] border-[#1E3851] text-white mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-white">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your project..."
          rows={4}
          className="bg-[#112941] border-[#1E3851] text-white mt-1"
        />
        <p className={`text-xs mt-1 ${formData.description.length >= 100 ? 'text-green-400' : 'text-red-400'}`}>
          {formData.description.length >= 100 
            ? `✓ ${formData.description.length} characters`
            : `⚠️ Minimum 100 characters required (currently: ${formData.description.length})`
          }
        </p>
      </div>
      
      <div>
        <Label htmlFor="category" className="text-white">Category *</Label>
        <Select value={formData.category} onValueChange={(val) => updateField('category', val)}>
          <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white mt-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-[#112941] border-[#1E3851]">
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="githubUrl" className="text-white">GitHub URL *</Label>
          <Input
            id="githubUrl"
            value={formData.githubUrl}
            onChange={(e) => updateField('githubUrl', e.target.value)}
            placeholder="https://github.com/username/repo"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="websiteUrl" className="text-white">Website URL</Label>
          <Input
            id="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) => updateField('websiteUrl', e.target.value)}
            placeholder="https://example.com"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="demoUrl" className="text-white">Demo URL</Label>
        <Input
          id="demoUrl"
          value={formData.demoUrl}
          onChange={(e) => updateField('demoUrl', e.target.value)}
          placeholder="https://demo.example.com"
          className="bg-[#112941] border-[#1E3851] text-white mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discordContact" className="text-white">Discord Contact</Label>
          <Input
            id="discordContact"
            value={formData.discordContact}
            onChange={(e) => updateField('discordContact', e.target.value)}
            placeholder="username#1234"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="telegramContact" className="text-white">Telegram Contact</Label>
          <Input
            id="telegramContact"
            value={formData.telegramContact}
            onChange={(e) => updateField('telegramContact', e.target.value)}
            placeholder="@username"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
      </div>
      
      {/* Images Upload */}
      <div className="space-y-3">
        <Label className="text-white">Project Images</Label>
        
        {/* Logo */}
        <div>
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border border-[#1E3851] rounded-lg bg-[#112941] text-white hover:bg-[#1E3851] transition-colors w-fit">
              <Upload className="h-4 w-4" />
              <span>Upload Logo (max 2MB)</span>
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
          {logoPreview && (
            <div className="relative w-20 h-20 mt-2 border border-[#1E3851] rounded-lg overflow-hidden">
              <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
              <button
                onClick={removeLogo}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Banner */}
        <div>
          <label htmlFor="banner-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border border-[#1E3851] rounded-lg bg-[#112941] text-white hover:bg-[#1E3851] transition-colors w-fit">
              <Upload className="h-4 w-4" />
              <span>Upload Banner (max 5MB)</span>
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
          </label>
          {bannerPreview && (
            <div className="relative w-full h-32 mt-2 border border-[#1E3851] rounded-lg overflow-hidden">
              <Image src={bannerPreview} alt="Banner preview" fill className="object-cover" />
              <button
                onClick={removeBanner}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Screenshots */}
        <div>
          <label htmlFor="screenshots-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border border-[#1E3851] rounded-lg bg-[#112941] text-white hover:bg-[#1E3851] transition-colors w-fit">
              <Upload className="h-4 w-4" />
              <span>Upload Screenshots (max 5, 2MB each)</span>
            </div>
            <input
              id="screenshots-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotsUpload}
              className="hidden"
            />
          </label>
          {screenshotPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {screenshotPreviews.map((preview, index) => (
                <div key={index} className="relative h-24 border border-[#1E3851] rounded-lg overflow-hidden">
                  <Image src={preview} alt={`Screenshot ${index + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => removeScreenshot(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

