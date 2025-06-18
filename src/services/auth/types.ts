export interface User {
  id: string;
  privyUserId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
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
}

export interface AuthError {
  success: false;
  message: string;
  code: string;
} 