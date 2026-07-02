import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Globe, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Project } from "@/services/ecosystem/project/types";
import { ProtectedAction } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { safeHref } from "@/lib/safeUrl";

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

  const XIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;

  const socialLinks = [
    { url: project.website, IconComponent: Globe, label: "Website" },
    { url: project.twitter, IconComponent: XIcon, label: "Twitter" },
    { url: project.discord, IconComponent: MessageCircle, label: "Discord" },
    { url: project.telegram, IconComponent: Send, label: "Telegram" }
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
    <Card
      padding="md"
      className={`hover:border-border-default group relative ${isSelected ? 'border-brand bg-brand/5' : ''}`}
    >
      {/* Selection checkbox for admins */}
      {showSelection && (
        <ProtectedAction requiredRole="ADMIN" user={user}>
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              disabled={isDeleting}
              className="bg-base border-border-default data-[state=checked]:bg-brand data-[state=checked]:border-brand"
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
            className="p-1 h-auto text-danger hover:text-danger hover:bg-danger/10"
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
            <div className="w-full h-full rounded-lg bg-brand/10 flex items-center justify-center">
              <span className="text-brand text-lg font-bold">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Link
              href={`/ecosystem/project/${project.id}`}
              className="text-base text-text-primary font-semibold truncate hover:text-brand transition-colors"
            >
              {project.title}
            </Link>
            {project.categories && project.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.categories.map(category => (
                  <span key={category.id} className="text-label text-brand bg-brand/10 px-2 py-1 rounded-md whitespace-nowrap">
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
                  href={safeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-brand transition-colors"
                  aria-label={link.label}
                >
                  <link.IconComponent className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});