import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Github, Globe, MessageCircle, Send, Users, Code2, DollarSign, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react";
import { PublicGood } from "@/services/ecosystem/publicgood";
import { User } from "@/services/auth/types";
import { hasRole } from "@/lib/roleHelpers";
import Link from "next/link";
import Image from "next/image";

interface PublicGoodsCardProps {
  project: PublicGood;
  currentUser?: User | null;
  onEdit?: (project: PublicGood) => void;
  onDelete?: (project: PublicGood) => void;
  onReview?: (project: PublicGood) => void;
}

export const PublicGoodsCard = memo(function PublicGoodsCard({ 
  project, 
  currentUser,
  onEdit,
  onDelete,
  onReview
}: PublicGoodsCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Check permissions
  const isOwner = currentUser && 'submitterId' in project ? Number(currentUser.id) === project.submitterId : false;
  const isAdmin = currentUser ? hasRole(currentUser, 'ADMIN') : false;
  const isModerator = currentUser ? hasRole(currentUser, 'MODERATOR') : false;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canReview = (isModerator || isAdmin) && (project.status === 'pending' || project.status === 'PENDING');
  const showActions = canEdit || canDelete || canReview;
  
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
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
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
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
    const normalizedSize = project.teamSize.toLowerCase();
    switch (normalizedSize) {
      case 'solo':
        return <Users className="w-3 h-3" />;
      case 'small':
      case '2-3':
        return <Users className="w-4 h-4" />;
      case 'large':
      case '4+':
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-6 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all group relative">
      <Link href={`/ecosystem/publicgoods/${project.id}`} className="cursor-pointer">
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
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            
            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#112941]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-[#0A1F32] border-[#1E3851]" 
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canEdit && onEdit && (
                    <DropdownMenuItem 
                      className="text-gray-300 hover:text-white hover:bg-[#112941] cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(project);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canReview && onReview && (
                    <DropdownMenuItem 
                      className="text-[#83E9FF] hover:text-white hover:bg-[#112941] cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onReview(project);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review
                    </DropdownMenuItem>
                  )}
                  {canDelete && onDelete && (
                    <DropdownMenuItem 
                      className="text-red-400 hover:text-white hover:bg-red-500/20 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(project);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
        {(() => {
          const supportTypes = 'supportTypes' in project ? project.supportTypes : 
                              'supportRequested' in project ? project.supportRequested?.types : [];
          
          if (!supportTypes || supportTypes.length === 0) return null;
          
          return (
            <div className="flex flex-wrap gap-2 mb-4">
              {supportTypes.map((type: string) => (
                <div key={type} className="flex items-center gap-1">
                  {(type === 'funding' || type === 'FUNDING') && <DollarSign className="w-3 h-3 text-[#F9E370]" />}
                  {(type === 'promotion' || type === 'PROMOTION') && <Globe className="w-3 h-3 text-[#83E9FF]" />}
                  {(type === 'services' || type === 'SERVICES') && <Code2 className="w-3 h-3 text-purple-400" />}
                  {(type === 'contributors' || type === 'CONTRIBUTORS') && <Users className="w-3 h-3 text-green-400" />}
                  <span className="text-xs text-gray-400">{type.toLowerCase()}</span>
                </div>
              ))}
            </div>
          );
        })()}

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
      </Link>
    </Card>
  );
});
