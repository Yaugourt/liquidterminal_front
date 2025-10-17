import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { TEAM_SIZES, EXPERIENCE_LEVELS } from "@/lib/publicgoods-helpers";

interface TeamTabProps {
  formData: {
    leadDeveloperName: string;
    leadDeveloperContact: string;
    teamSize: string;
    experienceLevel: string;
    technologies: string[];
  };
  updateField: (field: string, value: string) => void;
  techInput: string;
  setTechInput: (value: string) => void;
  addTechnology: () => void;
  removeTechnology: (tech: string) => void;
}

export function TeamTab({ 
  formData, 
  updateField, 
  techInput, 
  setTechInput, 
  addTechnology, 
  removeTechnology 
}: TeamTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leadDeveloperName" className="text-white">Lead Developer Name *</Label>
          <Input
            id="leadDeveloperName"
            value={formData.leadDeveloperName}
            onChange={(e) => updateField('leadDeveloperName', e.target.value)}
            placeholder="John Doe"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="leadDeveloperContact" className="text-white">Lead Developer Email *</Label>
          <Input
            id="leadDeveloperContact"
            type="email"
            value={formData.leadDeveloperContact}
            onChange={(e) => updateField('leadDeveloperContact', e.target.value)}
            placeholder="john@example.com"
            className="bg-[#112941] border-[#1E3851] text-white mt-1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teamSize" className="text-white">Team Size *</Label>
          <Select value={formData.teamSize} onValueChange={(val) => updateField('teamSize', val)}>
            <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white mt-1">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent className="bg-[#112941] border-[#1E3851]">
              {TEAM_SIZES.map(size => (
                <SelectItem key={size.value} value={size.value} className="text-white">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="experienceLevel" className="text-white">Experience Level *</Label>
          <Select value={formData.experienceLevel} onValueChange={(val) => updateField('experienceLevel', val)}>
            <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white mt-1">
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent className="bg-[#112941] border-[#1E3851]">
              {EXPERIENCE_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value} className="text-white">
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="technologies" className="text-white">Technologies * (at least 1)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="technologies"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTechnology();
              }
            }}
            placeholder="Type a technology and press Enter"
            className="bg-[#112941] border-[#1E3851] text-white"
          />
          <Button
            type="button"
            onClick={addTechnology}
            className="bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.technologies.map(tech => (
            <Badge
              key={tech}
              variant="outline"
              className="border-[#1E3851] text-gray-300 flex items-center gap-1"
            >
              {tech}
              <button
                onClick={() => removeTechnology(tech)}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

