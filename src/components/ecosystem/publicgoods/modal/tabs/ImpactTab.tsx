import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEVELOPMENT_STATUSES } from "@/lib/publicgoods-helpers";

const TARGET_USER_OPTIONS = [
  "developers",
  "traders",
  "investors",
  "market makers",
  "quant researchers",
  "liquidity providers",
  "retail users",
  "institutions"
];

interface ImpactTabProps {
  formData: {
    problemSolved: string;
    targetUsers: string[];
    hlIntegration: string;
    developmentStatus: string;
  };
  updateField: (field: string, value: string) => void;
  toggleTargetUser: (user: string) => void;
}

export function ImpactTab({ formData, updateField, toggleTargetUser }: ImpactTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="problemSolved" className="text-white">Problem Solved * (min 50 chars)</Label>
        <Textarea
          id="problemSolved"
          value={formData.problemSolved}
          onChange={(e) => updateField('problemSolved', e.target.value)}
          placeholder="What problem does your project solve for HyperLiquid users?"
          rows={4}
          className="bg-[#112941] border-[#1E3851] text-white mt-1"
        />
        <p className="text-xs text-gray-400 mt-1">{formData.problemSolved.length}/50</p>
      </div>
      
      <div>
        <Label className="text-white">Target Users * (select at least 1)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {TARGET_USER_OPTIONS.map(user => (
            <div key={user} className="flex items-center space-x-2">
              <Checkbox
                id={user}
                checked={formData.targetUsers.includes(user)}
                onCheckedChange={() => toggleTargetUser(user)}
                className="border-[#1E3851] data-[state=checked]:bg-[#83E9FF] data-[state=checked]:text-black data-[state=checked]:border-[#83E9FF]"
              />
              <label htmlFor={user} className="text-sm text-gray-300 capitalize cursor-pointer">
                {user}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="hlIntegration" className="text-white">HyperLiquid Integration * (min 50 chars)</Label>
        <Textarea
          id="hlIntegration"
          value={formData.hlIntegration}
          onChange={(e) => updateField('hlIntegration', e.target.value)}
          placeholder="How does your project integrate with HyperLiquid? Which APIs, endpoints, or features do you use?"
          rows={4}
          className="bg-[#112941] border-[#1E3851] text-white mt-1"
        />
        <p className="text-xs text-gray-400 mt-1">{formData.hlIntegration.length}/50</p>
      </div>
      
      <div>
        <Label htmlFor="developmentStatus" className="text-white">Development Status *</Label>
        <Select value={formData.developmentStatus} onValueChange={(val) => updateField('developmentStatus', val)}>
          <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-[#112941] border-[#1E3851]">
            {DEVELOPMENT_STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value} className="text-white">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

