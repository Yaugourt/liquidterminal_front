// Enums
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DevelopmentStatus = 'IDEA' | 'DEVELOPMENT' | 'BETA' | 'PRODUCTION';
export type TeamSize = 'SOLO' | 'SMALL' | 'LARGE';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
export type SupportType = 'PROMOTION' | 'SERVICES' | 'FUNDING' | 'CONTRIBUTOR';
export type ContributorType = 'DEVELOPERS' | 'DESIGNERS' | 'MARKETING_COMMUNITY' | 'TECHNICAL_WRITERS' | 'QA_TESTERS';
export type BudgetRange = 'RANGE_0_5K' | 'RANGE_5_15K' | 'RANGE_15_30K' | 'RANGE_30_50K' | 'RANGE_50K_PLUS';

// Main entity
export interface PublicGood {
  id: number;
  createdAt: string;
  updatedAt: string;
  
  // Section 1: Project
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string | null;
  websiteUrl: string | null;
  category: string;
  discordContact: string | null;
  telegramContact: string | null;
  
  // Visuals
  logo: string | null;
  banner: string | null;
  screenshots: string[];
  
  // Section 2: HyperLiquid Impact
  problemSolved: string;
  targetUsers: string[];
  hlIntegration: string;
  developmentStatus: DevelopmentStatus;
  
  // Section 3: Team & Technical
  leadDeveloperName: string;
  leadDeveloperContact: string;
  teamSize: TeamSize;
  experienceLevel: ExperienceLevel;
  technologies: string[];
  
  // Section 4: Support requested
  supportTypes: SupportType[];
  contributorTypes: ContributorType[];
  budgetRange: BudgetRange | null;
  
  // Metadata
  status: ProjectStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  submitterId: number;
  reviewerId: number | null;
  
  // Relations
  submittedBy: {
    id: number;
    name: string | null;
    email: string | null;
  };
  reviewedBy: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
}

// Query params for GET /publicgoods
export interface PublicGoodQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  category?: string;
  search?: string;
  developmentStatus?: DevelopmentStatus;
  sort?: 'submittedAt' | 'name' | 'updatedAt' | 'createdAt';
  order?: 'asc' | 'desc';
}

// Response interfaces
export interface PublicGoodsResponse {
  success: boolean;
  data: PublicGood[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PublicGoodResponse {
  success: boolean;
  message: string;
  data: PublicGood;
}

export interface PublicGoodDetailResponse {
  success: boolean;
  data: PublicGood;
}

// Input interfaces for mutations
export interface CreatePublicGoodInput {
  // Section 1: Project (REQUIRED)
  name: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  websiteUrl?: string;
  category: string;
  discordContact?: string;
  telegramContact?: string;
  
  // Section 2: Impact (REQUIRED)
  problemSolved: string;
  targetUsers: string[];
  hlIntegration: string;
  developmentStatus: DevelopmentStatus;
  
  // Section 3: Team (REQUIRED)
  leadDeveloperName: string;
  leadDeveloperContact: string;
  teamSize: TeamSize;
  experienceLevel: ExperienceLevel;
  technologies: string[];
  
  // Section 4: Support (OPTIONAL)
  supportTypes?: SupportType[];
  contributorTypes?: ContributorType[];
  budgetRange?: BudgetRange;
  
  // Files (OPTIONAL)
  logo?: File;
  banner?: File;
  screenshots?: File[];
}

export interface UpdatePublicGoodInput {
  name?: string;
  description?: string;
  githubUrl?: string;
  demoUrl?: string;
  websiteUrl?: string;
  category?: string;
  discordContact?: string;
  telegramContact?: string;
  problemSolved?: string;
  targetUsers?: string[];
  hlIntegration?: string;
  developmentStatus?: DevelopmentStatus;
  leadDeveloperName?: string;
  leadDeveloperContact?: string;
  teamSize?: TeamSize;
  experienceLevel?: ExperienceLevel;
  technologies?: string[];
  supportTypes?: SupportType[];
  contributorTypes?: ContributorType[];
  budgetRange?: BudgetRange;
  logo?: File;
  banner?: File;
  screenshots?: File[];
}

export interface ReviewPublicGoodInput {
  status: 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
}

// Delete response
export interface DeletePublicGoodResponse {
  success: boolean;
  message: string;
}

