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
        <Label htmlFor="problemSolved" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Problem Solved *</Label>
        <Textarea
          id="problemSolved"
          value={formData.problemSolved}
          onChange={(e) => updateField('problemSolved', e.target.value)}
          placeholder="What problem does your project solve for HyperLiquid users?"
          rows={4}
          className="bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50 mt-1"
        />
        <p className={`text-xs mt-1 ${formData.problemSolved.length >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {formData.problemSolved.length >= 50 
            ? `✓ ${formData.problemSolved.length} characters`
            : `⚠️ Minimum 50 characters required (currently: ${formData.problemSolved.length})`
          }
        </p>
      </div>
      
      <div>
        <Label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Target Users * (select at least 1)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {TARGET_USER_OPTIONS.map(user => (
            <div key={user} className="flex items-center space-x-2 p-2 bg-[#0A0D12] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
              <Checkbox
                id={user}
                checked={formData.targetUsers.includes(user)}
                onCheckedChange={() => toggleTargetUser(user)}
                className="border-white/10 data-[state=checked]:bg-[#83E9FF] data-[state=checked]:text-[#051728] data-[state=checked]:border-[#83E9FF]"
              />
              <label htmlFor={user} className="text-sm text-zinc-300 capitalize cursor-pointer">
                {user}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="hlIntegration" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">HyperLiquid Integration *</Label>
        <Textarea
          id="hlIntegration"
          value={formData.hlIntegration}
          onChange={(e) => updateField('hlIntegration', e.target.value)}
          placeholder="How does your project integrate with HyperLiquid? Which APIs, endpoints, or features do you use?"
          rows={4}
          className="bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50 mt-1"
        />
        <p className={`text-xs mt-1 ${formData.hlIntegration.length >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {formData.hlIntegration.length >= 50 
            ? `✓ ${formData.hlIntegration.length} characters`
            : `⚠️ Minimum 50 characters required (currently: ${formData.hlIntegration.length})`
          }
        </p>
      </div>
      
      <div>
        <Label htmlFor="developmentStatus" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Development Status *</Label>
        <Select value={formData.developmentStatus} onValueChange={(val) => updateField('developmentStatus', val)}>
          <SelectTrigger className="bg-[#0A0D12] border-white/5 text-white rounded-lg mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-[#151A25] border-white/10 rounded-xl">
            {DEVELOPMENT_STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value} className="text-zinc-300 hover:bg-white/5 focus:bg-white/5 rounded-lg">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

