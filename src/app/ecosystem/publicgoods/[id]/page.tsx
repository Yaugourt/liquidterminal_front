"use client";

import { Header } from "@/components/Header";
import { useState, use, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, ArrowLeft, Github, Globe, MessageCircle, Send, Users, Code2, DollarSign, User, Mail, ExternalLink, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { EditProjectModal } from "@/components/ecosystem/publicgoods/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ecosystem/publicgoods/DeleteConfirmDialog";
import { useAuthContext } from "@/contexts/auth.context";
import { hasRole } from "@/lib/roleHelpers";
import { useRouter } from "next/navigation";
import { usePublicGood, useDeletePublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useWindowSize } from "@/hooks/use-window-size";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { width } = useWindowSize();
  
  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuthContext();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);
  
  // Fetch project from API
  const { publicGood: project, isLoading, refetch } = usePublicGood(parseInt(resolvedParams.id));
  const { deletePublicGood, isLoading: isDeleting } = useDeletePublicGood();

  // Check permissions
  const isOwner = user && project ? Number(user.id) === project.submitterId : false;
  const isAdmin = user ? hasRole(user, 'ADMIN') : false;
  const isModerator = user ? hasRole(user, 'MODERATOR') : false;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canReview = (isModerator || isAdmin) && project?.status === 'PENDING';

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!project) return;
    
    try {
      await deletePublicGood(project.id);
      toast.success("Project deleted successfully!");
      router.push('/ecosystem/publicgoods');
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-6 h-6 text-[#83E9FF] animate-spin mb-2" />
          <span className="text-zinc-500 text-sm">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-4">Project not found</h1>
            <Button onClick={() => router.back()} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg">
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="">
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle="Public Goods" showFees={true} />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Back button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to projects
            </Button>
          </div>

          {/* Project header */}
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  {/* Logo */}
                  <div className="relative w-20 h-20 flex-shrink-0">
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
                        <span className="text-[#83E9FF] text-2xl font-bold">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Title and status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                      <Badge className={getStatusColor(project.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(project.status)}
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-300">{project.description}</p>
                  </div>
                </div>
                
                {/* Links */}
                <div className="flex items-center gap-4">
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#83E9FF] hover:text-white transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {project.websiteUrl && (
                    <Link
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#83E9FF] hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#F9E370] hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      Demo
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Submitted</div>
                <div className="text-[#83E9FF] font-medium">{new Date(project.submittedAt).toLocaleDateString()}</div>
                {project.reviewedAt && (
                  <>
                    <div className="text-sm text-gray-400 mb-1 mt-2">Reviewed</div>
                    <div className="text-[#83E9FF] font-medium">{new Date(project.reviewedAt).toLocaleDateString()}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Banner */}
            {project.banner && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image
                  src={project.banner}
                  alt={`${project.name} banner`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F32]/60 to-transparent" />
              </div>
            )}
          </div>

          {/* Content sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 2: Impact HyperLiquid */}
              <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Impact on HyperLiquid</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Problem Solved</h3>
                    <p className="text-zinc-400 text-sm">{project.problemSolved}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Target Users</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.targetUsers.map(user => (
                        <Badge key={user} variant="outline" className="border-white/10 text-zinc-400 text-xs">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">HyperLiquid Integration</h3>
                    <p className="text-zinc-400 text-sm">{project.hlIntegration}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Development Status</h3>
                    <Badge className="bg-[#83E9FF]/10 text-[#83E9FF] text-xs">
                      {project.developmentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Section 3: Team & Technical */}
              <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Team & Technical Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Lead Developer</h3>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#83E9FF]" />
                      <span className="text-white text-sm">{project.leadDeveloperName}</span>
                      <Mail className="w-4 h-4 text-zinc-500 ml-2" />
                      <span className="text-zinc-400 text-sm">{project.leadDeveloperContact}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Team Size</h3>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#83E9FF]" />
                        <span className="text-white text-sm">{project.teamSize}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Experience Level</h3>
                      <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                        {project.experienceLevel}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Category</h3>
                      <Badge className="bg-[#83E9FF]/10 text-[#83E9FF] text-xs">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <Badge key={tech} variant="outline" className="border-[#83E9FF]/20 text-[#83E9FF] text-xs">
                          <Code2 className="w-3 h-3 mr-1" />
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Support Requested */}
              {(project.supportTypes.length > 0 || project.budgetRange) && (
                <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Support Requested</h2>
                  
                  <div className="space-y-4">
                    {project.supportTypes.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Types of Support</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.supportTypes.map((type: string) => (
                            <div key={type} className="flex items-center gap-2 bg-[#0A0D12] border border-white/5 px-3 py-1.5 rounded-lg">
                              {type === 'FUNDING' && <DollarSign className="w-4 h-4 text-amber-400" />}
                              {type === 'PROMOTION' && <Globe className="w-4 h-4 text-[#83E9FF]" />}
                              {type === 'SERVICES' && <Code2 className="w-4 h-4 text-purple-400" />}
                              {type === 'CONTRIBUTOR' && <Users className="w-4 h-4 text-emerald-400" />}
                              <span className="text-white text-xs capitalize">{type.toLowerCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {project.supportTypes.includes('CONTRIBUTOR') && project.contributorTypes.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Looking for Contributors</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.contributorTypes.map((type: string) => (
                            <div key={type} className="flex items-center gap-2 bg-[#0A0D12] border border-white/5 px-3 py-1.5 rounded-lg">
                              <Users className="w-4 h-4 text-emerald-400" />
                              <span className="text-white text-xs capitalize">{type.toLowerCase().replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {project.budgetRange && (
                      <div>
                        <h3 className="text-[10px] font-semibold text-[#83E9FF] uppercase tracking-wider mb-2">Budget Range</h3>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          <span className="text-white text-sm">{project.budgetRange.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h3 className="text-sm font-bold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                  {project.discordContact && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                      <span className="text-zinc-400 text-sm">{project.discordContact}</span>
                    </div>
                  )}
                  {project.telegramContact && (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#0088CC]" />
                      <span className="text-zinc-400 text-sm">{project.telegramContact}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400 text-sm">{project.leadDeveloperContact}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                <h3 className="text-sm font-bold text-white mb-4">Project Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Status</span>
                    <Badge className={`${getStatusColor(project.status)} border text-xs`}>
                      <span className="lowercase first-letter:uppercase">{project.status.replace(/_/g, ' ')}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Category</span>
                    <span className="text-[#83E9FF] text-xs font-medium lowercase first-letter:uppercase">{project.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Team Size</span>
                    <span className="text-[#83E9FF] text-xs font-medium lowercase first-letter:uppercase">{project.teamSize.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Experience</span>
                    <span className="text-[#83E9FF] text-xs font-medium lowercase first-letter:uppercase">{project.experienceLevel.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Stage</span>
                    <span className="text-[#83E9FF] text-xs font-medium lowercase first-letter:uppercase">{project.developmentStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(canEdit || canDelete || canReview) && (
                <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Manage Project</h3>
                  <div className="space-y-3">
                    {canReview && (
                      <Button 
                        onClick={handleReview}
                        className="w-full bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Review Project
                      </Button>
                    )}
                    {canEdit && (
                      <Button 
                        onClick={handleEdit}
                        variant="outline"
                        className="w-full border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Project
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        onClick={handleDelete}
                        variant="outline"
                        className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Review Modal */}
      {project && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
          project={project}
        />
      )}

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          project={project}
        />
      )}

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        projectName={project?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
