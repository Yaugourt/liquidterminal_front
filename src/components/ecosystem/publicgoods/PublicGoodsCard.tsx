import { memo, useState } from "react";
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getDevelopmentStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'production':
        return 'bg-[#83E9FF]/10 text-[#83E9FF]';
      case 'beta':
        return 'bg-blue-500/10 text-blue-400';
      case 'development':
        return 'bg-purple-500/10 text-purple-400';
      case 'idea':
        return 'bg-zinc-500/10 text-zinc-400';
      default:
        return 'bg-zinc-500/10 text-zinc-400';
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
    <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 hover:border-white/10 transition-all group relative">
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
                  className="rounded-xl object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
                  <span className="text-[#83E9FF] text-lg font-bold">
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
              <p className="text-sm text-zinc-500 mt-1">{project.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(project.status)} border`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            
            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-[#151A25] border-white/10 rounded-xl shadow-xl shadow-black/20" 
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canEdit && onEdit && (
                    <DropdownMenuItem 
                      className="text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
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
                      className="text-[#83E9FF] hover:text-white hover:bg-white/5 cursor-pointer"
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
                      className="text-rose-400 hover:text-white hover:bg-rose-500/10 cursor-pointer"
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
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Problem solved */}
        <div className="mb-4">
          <p className="text-[10px] text-[#83E9FF] uppercase tracking-wider font-semibold mb-1">Problem Solved:</p>
          <p className="text-sm text-zinc-400 line-clamp-2">
            {project.problemSolved}
          </p>
        </div>

        {/* Tags and info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={`${getDevelopmentStatusColor(project.developmentStatus)} border-0`}>
            {project.developmentStatus}
          </Badge>
          <div className="flex items-center gap-1 text-zinc-500">
            {getTeamSizeIcon()}
            <span className="text-xs">{project.teamSize} team</span>
          </div>
          <Badge variant="outline" className="text-xs border-white/10 text-zinc-400">
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
                  {(type === 'funding' || type === 'FUNDING') && <DollarSign className="w-3 h-3 text-amber-400" />}
                  {(type === 'promotion' || type === 'PROMOTION') && <Globe className="w-3 h-3 text-[#83E9FF]" />}
                  {(type === 'services' || type === 'SERVICES') && <Code2 className="w-3 h-3 text-purple-400" />}
                  {(type === 'contributors' || type === 'CONTRIBUTOR') && <Users className="w-3 h-3 text-emerald-400" />}
                  <span className="text-xs text-zinc-500">{type.toLowerCase()}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          {project.githubUrl && (
            <div className="text-zinc-500 hover:text-[#83E9FF] transition-colors cursor-pointer">
              <Github className="w-4 h-4" />
            </div>
          )}
          {project.websiteUrl && (
            <div className="text-zinc-500 hover:text-[#83E9FF] transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
            </div>
          )}
          {project.discordContact && (
            <div className="text-zinc-500">
              <MessageCircle className="w-4 h-4" />
            </div>
          )}
          {project.telegramContact && (
            <div className="text-zinc-500">
              <Send className="w-4 h-4" />
            </div>
          )}
          <div className="ml-auto text-xs text-zinc-600">
            {new Date(project.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </div>
  );
});
