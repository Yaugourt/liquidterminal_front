import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORT_TYPES, CONTRIBUTOR_TYPES, BUDGET_RANGES } from "@/lib/publicgoods-helpers";

interface SupportTabProps {
  formData: {
    supportTypes: string[];
    contributorTypes: string[];
    budgetRange: string;
  };
  updateField: (field: string, value: string) => void;
  toggleSupportType: (type: string) => void;
  toggleContributorType: (type: string) => void;
}

export function SupportTab({ formData, updateField, toggleSupportType, toggleContributorType }: SupportTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">This section is optional. Let us know what kind of support would help your project.</p>
      
      <div>
        <Label className="text-white">Types of Support Needed</Label>
        <div className="space-y-2 mt-2">
          {SUPPORT_TYPES.map(type => (
            <div key={type.value} className="flex items-start space-x-3 p-3 border border-[#1E3851] rounded-lg">
              <Checkbox
                id={type.value}
                checked={formData.supportTypes.includes(type.value)}
                onCheckedChange={() => toggleSupportType(type.value)}
                className="border-[#1E3851] mt-1 data-[state=checked]:bg-[#83E9FF] data-[state=checked]:text-black data-[state=checked]:border-[#83E9FF]"
              />
              <div className="flex-1">
                <label htmlFor={type.value} className="text-sm text-white cursor-pointer flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {formData.supportTypes.includes('CONTRIBUTOR') && (
        <div>
          <Label className="text-white">What type of contributors are you looking for?</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CONTRIBUTOR_TYPES.map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`contributor-${type.value}`}
                  checked={formData.contributorTypes.includes(type.value)}
                  onCheckedChange={() => toggleContributorType(type.value)}
                  className="border-[#1E3851] data-[state=checked]:bg-[#83E9FF] data-[state=checked]:text-black data-[state=checked]:border-[#83E9FF]"
                />
                <label htmlFor={`contributor-${type.value}`} className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {formData.supportTypes.includes('FUNDING') && (
        <div>
          <Label htmlFor="budgetRange" className="text-white">Budget Range</Label>
          <Select value={formData.budgetRange} onValueChange={(val) => updateField('budgetRange', val)}>
            <SelectTrigger className="bg-[#112941] border-[#1E3851] text-white mt-1">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent className="bg-[#112941] border-[#1E3851]">
              {BUDGET_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value} className="text-white">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

