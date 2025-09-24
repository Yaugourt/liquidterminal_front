import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, MessageCircle, Send, Users, Code2, Clock, DollarSign } from "lucide-react";
import { PublicGoodsProject } from "./mockData";
import Link from "next/link";
import Image from "next/image";

interface PublicGoodsCardProps {
  project: PublicGoodsProject;
}

export const PublicGoodsCard = memo(function PublicGoodsCard({ project }: PublicGoodsCardProps) {
  const [imageError, setImageError] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDevelopmentStatusColor = (status: string) => {
    switch (status) {
      case 'production':
        return 'bg-[#83E9FF]/20 text-[#83E9FF]';
      case 'beta':
        return 'bg-blue-500/20 text-blue-400';
      case 'development':
        return 'bg-purple-500/20 text-purple-400';
      case 'idea':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTeamSizeIcon = () => {
    switch (project.teamSize) {
      case 'solo':
        return <Users className="w-3 h-3" />;
      case '2-3':
        return <Users className="w-4 h-4" />;
      case '4+':
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <Link href={`/ecosystem/publicgoods/${project.id}`}>
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-6 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all group cursor-pointer">
        {/* Header with logo and status badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Logo */}
            <div className="relative w-12 h-12 flex-shrink-0">
              {project.logo && !imageError ? (
                <Image
                  src={project.logo}
                  alt={project.name}
                  fill
                  className="rounded-lg object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-[#112941] flex items-center justify-center">
                  <span className="text-[#83E9FF] text-lg font-medium">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Project info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-[#83E9FF] transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{project.category}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(project.status)} ml-4`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Problem solved */}
        <div className="mb-4">
          <p className="text-xs text-[#F9E370] mb-1">Problem Solved:</p>
          <p className="text-sm text-gray-300 line-clamp-2">
            {project.problemSolved}
          </p>
        </div>

        {/* Tags and info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getDevelopmentStatusColor(project.developmentStatus)}>
            {project.developmentStatus}
          </Badge>
          <div className="flex items-center gap-1 text-gray-400">
            {getTeamSizeIcon()}
            <span className="text-xs">{project.teamSize} team</span>
          </div>
          <Badge variant="outline" className="text-xs border-[#1E3851] text-gray-400">
            {project.experienceLevel}
          </Badge>
        </div>

        {/* Support requested */}
        {project.supportRequested && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.supportRequested.types.map(type => (
              <div key={type} className="flex items-center gap-1">
                {type === 'funding' && <DollarSign className="w-3 h-3 text-[#F9E370]" />}
                {type === 'promotion' && <Globe className="w-3 h-3 text-[#83E9FF]" />}
                {type === 'services' && <Code2 className="w-3 h-3 text-purple-400" />}
                <span className="text-xs text-gray-400">{type}</span>
              </div>
            ))}
            {project.supportRequested.timeline && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{project.supportRequested.timeline} months</span>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#1E3851]">
          {project.githubUrl && (
            <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Github className="w-4 h-4" />
            </div>
          )}
          {project.websiteUrl && (
            <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
            </div>
          )}
          {project.discordContact && (
            <div className="text-gray-400">
              <MessageCircle className="w-4 h-4" />
            </div>
          )}
          {project.telegramContact && (
            <div className="text-gray-400">
              <Send className="w-4 h-4" />
            </div>
          )}
          <div className="ml-auto text-xs text-gray-500">
            {new Date(project.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </Card>
    </Link>
  );
});
