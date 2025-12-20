import { memo, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/services/ecosystem/project/types";
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
    { url: project.website, iconName: null, label: "Website", isGlobe: true },
    { url: project.twitter, iconName: "simple-icons:x", label: "Twitter", isGlobe: false },
    { url: project.discord, iconName: "ic:baseline-discord", label: "Discord", isGlobe: false },
    { url: project.telegram, iconName: "ic:baseline-telegram", label: "Telegram", isGlobe: false }
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
    <div className={`glass-token-card p-5 rounded-2xl shadow-xl shadow-black/20 group relative ${isSelected ? 'border-brand-accent bg-brand-accent/5' : ''
      }`}>
      {/* Selection checkbox for admins */}
      {showSelection && (
        <ProtectedAction requiredRole="ADMIN" user={user}>
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              disabled={isDeleting}
              className="bg-brand-dark border-white/20 data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent"
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
            className="p-1 h-auto text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
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
              className="rounded-xl object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-brand-accent/10 flex items-center justify-center">
              <span className="text-brand-accent text-lg font-bold">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base text-white font-semibold truncate">
              {project.title}
            </h3>
            {project.categories && project.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.categories.map(category => (
                  <span key={category.id} className="text-[10px] text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
            {project.desc}
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-brand-accent transition-colors"
                  aria-label={link.label}
                >
                  {link.isGlobe ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Icon icon={link.iconName!} className="w-4 h-4" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}); 