/**
 * Public Goods - Helpers, Validators & Constants
 */

// ==================== CONSTANTS ====================

export const CATEGORIES = [
  "Trading Tools",
  "Analytics",
  "Wallet",
  "DeFi",
  "Infrastructure",
  "Education",
  "Other"
] as const;

export const DEVELOPMENT_STATUSES = [
  { value: 'IDEA', label: 'Idea', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'DEVELOPMENT', label: 'Development', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'BETA', label: 'Beta', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'PRODUCTION', label: 'Production', color: 'bg-[#83E9FF]/20 text-[#83E9FF]' }
] as const;

export const TEAM_SIZES = [
  { value: 'SOLO', label: 'Solo (1 person)', description: 'Individual developer' },
  { value: 'SMALL', label: 'Small (2-3)', description: '2-3 people' },
  { value: 'LARGE', label: 'Large (4+)', description: '4 or more people' }
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Learning the ropes' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Solid experience' },
  { value: 'EXPERT', label: 'Expert', description: 'Professional level' }
] as const;

export const SUPPORT_TYPES = [
  { 
    value: 'PROMOTION', 
    label: 'Promotion', 
    description: 'Visibility & marketing support',
    icon: '📢'
  },
  { 
    value: 'SERVICES', 
    label: 'Services', 
    description: 'Technical services (hosting, infra, etc.)',
    icon: '🛠️'
  },
  { 
    value: 'FUNDING', 
    label: 'Funding', 
    description: 'Financial support',
    icon: '💰'
  },
  { 
    value: 'CONTRIBUTOR', 
    label: 'Contributors', 
    description: 'Looking for people to help build the project',
    icon: '👥'
  }
] as const;

export const CONTRIBUTOR_TYPES = [
  { value: 'DEVELOPERS', label: 'Developers', icon: '👨‍💻' },
  { value: 'DESIGNERS', label: 'Designers', icon: '🎨' },
  { value: 'MARKETING_COMMUNITY', label: 'Marketing/Community', icon: '📢' },
  { value: 'TECHNICAL_WRITERS', label: 'Technical Writers', icon: '📝' },
  { value: 'QA_TESTERS', label: 'QA/Testers', icon: '🧪' }
] as const;

export const BUDGET_RANGES = [
  { value: 'RANGE_0_5K', label: '$0-5k', description: 'Up to $5,000' },
  { value: 'RANGE_5_15K', label: '$5k-15k', description: '$5,000 - $15,000' },
  { value: 'RANGE_15_30K', label: '$15k-30k', description: '$15,000 - $30,000' },
  { value: 'RANGE_30_50K', label: '$30k-50k', description: '$30,000 - $50,000' },
  { value: 'RANGE_50K_PLUS', label: '$50k+', description: 'Over $50,000' }
] as const;

export const PROJECT_STATUSES = [
  { value: 'PENDING', label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
] as const;

// ==================== VALIDATION HELPERS ====================

/**
 * Validate GitHub URL format
 */
export const validateGithubUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com';
  } catch {
    return false;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate array has at least one element
 */
export const validateArrayNotEmpty = (arr: unknown[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Validate string meets minimum length
 */
export const validateMinLength = (text: string, minLength: number): boolean => {
  return !!(text && text.trim().length >= minLength);
};

/**
 * Validate required field
 */
export const validateRequired = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return value !== null && value !== undefined;
};

// ==================== FORMATTERS ====================

/**
 * Format budget range enum to display string
 */
export const formatBudgetRange = (range: string): string => {
  const found = BUDGET_RANGES.find(b => b.value === range);
  return found ? found.label : range;
};

/**
 * Format team size enum to display string
 */
export const formatTeamSize = (size: string): string => {
  const found = TEAM_SIZES.find(s => s.value === size);
  return found ? found.label : size;
};

/**
 * Format experience level enum to display string
 */
export const formatExperienceLevel = (level: string): string => {
  const found = EXPERIENCE_LEVELS.find(e => e.value === level);
  return found ? found.label : level;
};

/**
 * Format development status enum to display string
 */
export const formatDevelopmentStatus = (status: string): string => {
  const found = DEVELOPMENT_STATUSES.find(s => s.value === status);
  return found ? found.label : status;
};

/**
 * Get status badge color classes
 */
export const getStatusColor = (status: string): string => {
  const found = PROJECT_STATUSES.find(s => s.value === status);
  return found ? found.color : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Get development status color classes
 */
export const getDevelopmentStatusColor = (status: string): string => {
  const found = DEVELOPMENT_STATUSES.find(s => s.value === status);
  return found ? found.color : 'bg-gray-500/20 text-gray-400';
};

// ==================== FORM HELPERS ====================

/**
 * Build FormData from form values
 */
export const buildPublicGoodFormData = (data: {
  // Section 1: Projet
  name: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  websiteUrl?: string;
  category: string;
  discordContact?: string;
  telegramContact?: string;
  
  // Section 2: Impact
  problemSolved: string;
  targetUsers: string[];
  hlIntegration: string;
  developmentStatus: string;
  
  // Section 3: Team
  leadDeveloperName: string;
  leadDeveloperContact: string;
  teamSize: string;
  experienceLevel: string;
  technologies: string[];
  
  // Section 4: Support (optional)
  supportTypes?: string[];
  contributorTypes?: string[];
  budgetRange?: string;
  
  // Files
  logo?: File;
  banner?: File;
  screenshots?: File[];
}): FormData => {
  const formData = new FormData();
  
  // Section 1
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('githubUrl', data.githubUrl);
  if (data.demoUrl) formData.append('demoUrl', data.demoUrl);
  if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
  formData.append('category', data.category);
  if (data.discordContact) formData.append('discordContact', data.discordContact);
  if (data.telegramContact) formData.append('telegramContact', data.telegramContact);
  
  // Section 2
  formData.append('problemSolved', data.problemSolved);
  formData.append('targetUsers', JSON.stringify(data.targetUsers));
  formData.append('hlIntegration', data.hlIntegration);
  formData.append('developmentStatus', data.developmentStatus);
  
  // Section 3
  formData.append('leadDeveloperName', data.leadDeveloperName);
  formData.append('leadDeveloperContact', data.leadDeveloperContact);
  formData.append('teamSize', data.teamSize);
  formData.append('experienceLevel', data.experienceLevel);
  formData.append('technologies', JSON.stringify(data.technologies));
  
  // Section 4 (optional)
  if (data.supportTypes && data.supportTypes.length > 0) {
    formData.append('supportTypes', JSON.stringify(data.supportTypes));
  }
  if (data.contributorTypes && data.contributorTypes.length > 0) {
    formData.append('contributorTypes', JSON.stringify(data.contributorTypes));
  }
  if (data.budgetRange) {
    formData.append('budgetRange', data.budgetRange);
  }
  
  // Files
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  if (data.banner) {
    formData.append('banner', data.banner);
  }
  if (data.screenshots && data.screenshots.length > 0) {
    data.screenshots.forEach((file) => {
      formData.append('screenshots', file);
    });
  }
  
  return formData;
};

/**
 * Validate complete form before submission
 */
export const validatePublicGoodForm = (data: {
  name: string;
  description: string;
  githubUrl: string;
  category: string;
  problemSolved: string;
  targetUsers: string[];
  hlIntegration: string;
  developmentStatus: string;
  leadDeveloperName: string;
  leadDeveloperContact: string;
  teamSize: string;
  experienceLevel: string;
  technologies: string[];
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Section 1
  if (!validateRequired(data.name)) errors.push('Project name is required');
  if (!validateMinLength(data.name, 3)) errors.push('Project name must be at least 3 characters');
  if (!validateMinLength(data.description, 100)) errors.push('Description must be at least 100 characters');
  if (!validateGithubUrl(data.githubUrl)) errors.push('Valid GitHub URL is required');
  if (!validateRequired(data.category)) errors.push('Category is required');
  
  // Section 2
  if (!validateMinLength(data.problemSolved, 50)) errors.push('Problem solved must be at least 50 characters');
  if (!validateArrayNotEmpty(data.targetUsers)) errors.push('At least one target user is required');
  if (!validateMinLength(data.hlIntegration, 50)) errors.push('HyperLiquid integration description must be at least 50 characters');
  if (!validateRequired(data.developmentStatus)) errors.push('Development status is required');
  
  // Section 3
  if (!validateRequired(data.leadDeveloperName)) errors.push('Lead developer name is required');
  if (!validateEmail(data.leadDeveloperContact)) errors.push('Valid email is required for lead developer');
  if (!validateRequired(data.teamSize)) errors.push('Team size is required');
  if (!validateRequired(data.experienceLevel)) errors.push('Experience level is required');
  if (!validateArrayNotEmpty(data.technologies)) errors.push('At least one technology is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ==================== FILE VALIDATION ====================

/**
 * Validate image file
 */
export const validateImageFile = (file: File, maxSizeMB: number = 2): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG and WebP images are allowed' };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

/**
 * Validate multiple screenshots
 */
export const validateScreenshots = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (files.length > 5) {
    errors.push('Maximum 5 screenshots allowed');
  }
  
  files.forEach((file, index) => {
    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      errors.push(`Screenshot ${index + 1}: ${validation.error}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

