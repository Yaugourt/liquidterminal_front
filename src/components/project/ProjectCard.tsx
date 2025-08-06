import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { PiTwitterLogo, PiDiscordLogo, PiTelegramLogo, PiGlobeBold } from "react-icons/pi";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/services/project/types";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: number) => void;
  isDeleting?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (projectId: number, selected: boolean) => void;
  showSelection?: boolean;
}

export const ProjectCard = memo(function ProjectCard({ 
  project, 
  onDelete,
  isDeleting = false,
  isSelected = false,
  onSelectionChange,
  showSelection = false
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuthContext();

  const socialLinks = [
    { url: project.website, icon: PiGlobeBold, label: "Website" },
    { url: project.twitter, icon: PiTwitterLogo, label: "Twitter" },
    { url: project.discord, icon: PiDiscordLogo, label: "Discord" },
    { url: project.telegram, icon: PiTelegramLogo, label: "Telegram" }
  ].filter(link => link.url);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(project.id, checked);
    }
  };

  return (
    <Card className={`bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all group relative ${
      isSelected ? 'border-[#F9E370] bg-[#F9E37010]' : ''
    }`}>
      {/* Selection checkbox for admins */}
      {showSelection && (
        <ProtectedAction requiredRole="ADMIN" user={user}>
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              disabled={isDeleting}
              className="bg-[#0A1F32] border-[#F9E370] data-[state=checked]:bg-[#F9E370] data-[state=checked]:border-[#F9E370]"
            />
          </div>
        </ProtectedAction>
      )}

      {/* Delete button for admins */}
      <ProtectedAction requiredRole="ADMIN" user={user}>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            onClick={handleDelete}
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            className="p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
            title="Delete project"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </ProtectedAction>

      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          {!imageError ? (
            <Image
              src={project.logo}
              alt={project.title}
              fill
              className="rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-[#112941] flex items-center justify-center">
              <span className="text-[#83E9FF] text-lg font-medium">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-[16px] text-white font-medium truncate">
              {project.title}
            </h3>
            {project.categories && project.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.categories.map(category => (
                  <span key={category.id} className="text-xs text-[#83E9FF] bg-[#83E9FF20] px-2 py-1 rounded-full font-medium whitespace-nowrap">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {project.desc}
          </p>
          
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F9E370] hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}); 