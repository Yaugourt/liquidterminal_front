import { Badge } from "@/components/ui/badge";
import { DEVELOPMENT_STATUSES, TEAM_SIZES, SUPPORT_TYPES, CONTRIBUTOR_TYPES } from "@/lib/publicgoods-helpers";

interface PreviewTabProps {
  formData: {
    name: string;
    category: string;
    githubUrl: string;
    developmentStatus: string;
    teamSize: string;
    technologies: string[];
    targetUsers: string[];
    supportTypes: string[];
    contributorTypes: string[];
  };
}

export function PreviewTab({ formData }: PreviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#112941] p-4 rounded-lg border border-[#1E3851]">
        <h3 className="text-lg font-semibold text-white mb-4">Review Your Submission</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Project Name</p>
            <p className="text-white">{formData.name || "—"}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Category</p>
            <p className="text-white">{formData.category || "—"}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">GitHub</p>
            <p className="text-white break-all">{formData.githubUrl || "—"}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Development Status</p>
            <p className="text-white">
              {DEVELOPMENT_STATUSES.find(s => s.value === formData.developmentStatus)?.label || "—"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Team Size</p>
            <p className="text-white">
              {TEAM_SIZES.find(s => s.value === formData.teamSize)?.label || "—"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Technologies</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.technologies.length > 0 ? (
                formData.technologies.map(tech => (
                  <Badge key={tech} variant="outline" className="border-[#1E3851] text-gray-300">
                    {tech}
                  </Badge>
                ))
              ) : (
                <span className="text-white">—</span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Target Users</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.targetUsers.length > 0 ? (
                formData.targetUsers.map(user => (
                  <Badge key={user} variant="outline" className="border-[#1E3851] text-gray-300 capitalize">
                    {user}
                  </Badge>
                ))
              ) : (
                <span className="text-white">—</span>
              )}
            </div>
          </div>
          
          {formData.supportTypes.length > 0 && (
            <div>
              <p className="text-sm text-gray-400">Support Requested</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.supportTypes.map(type => {
                  const supportType = SUPPORT_TYPES.find(s => s.value === type);
                  return (
                    <Badge key={type} variant="outline" className="border-[#1E3851] text-gray-300">
                      {supportType?.icon} {supportType?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {formData.supportTypes.includes('CONTRIBUTORS') && formData.contributorTypes.length > 0 && (
            <div>
              <p className="text-sm text-gray-400">Looking for Contributors</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.contributorTypes.map(type => {
                  const contributorType = CONTRIBUTOR_TYPES.find(c => c.value === type);
                  return (
                    <Badge key={type} variant="outline" className="border-[#1E3851] text-gray-300">
                      {contributorType?.icon} {contributorType?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
        <p className="text-sm text-yellow-400">
          ⚠️ Once submitted, your project will be reviewed by our team. 
          You&apos;ll be able to edit it later if needed.
        </p>
      </div>
    </div>
  );
}

