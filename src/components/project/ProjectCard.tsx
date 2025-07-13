import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { PiTwitterLogo, PiDiscordLogo, PiTelegramLogo, PiGlobeBold } from "react-icons/pi";
import { Project } from "@/services/project/types";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const socialLinks = [
    { url: project.website, icon: PiGlobeBold, label: "Website" },
    { url: project.twitter, icon: PiTwitterLogo, label: "Twitter" },
    { url: project.discord, icon: PiDiscordLogo, label: "Discord" },
    { url: project.telegram, icon: PiTelegramLogo, label: "Telegram" }
  ].filter(link => link.url);

  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all group">
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
            {project.category && (
              <span className="text-xs text-[#83E9FF] bg-[#83E9FF20] px-2 py-1 rounded-full font-medium whitespace-nowrap">
                {project.category.name}
              </span>
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
                    className="text-gray-400 hover:text-[#83E9FF] transition-colors"
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