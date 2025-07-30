export interface User {
  id: string;
  privyUserId: string;
  name: string;
  email?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // NOUVEAUX CHAMPS REFERRAL
  referralCount: number;
  referredBy: string | null;
  referralCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface LoginCredentials {
  privyUserId: string;
  name: string;
  privyToken: string;
  // NOUVEAU CHAMP REFERRAL
  referrerName?: string;
}

export interface AuthError {
  success: false;
  message: string;
  code: string;
}

// NOUVEAUX TYPES POUR LE SYSTÈME DE REFERRAL
export interface ReferralStats {
  referralCount: number;
  referredBy: string | null;
  referrals: Array<{
    id: number;
    name: string | null;
    createdAt: string;
  }>;
}

export interface ReferralValidationResponse {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
  };
}

export interface ReferralLink {
  username: string;
  fullUrl: string;
  shortCode: string;
} 