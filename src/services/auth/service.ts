import { authService } from './api';
import { LoginCredentials } from './types';

export class AuthService {
  private static instance: AuthService;
  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async ensureUserInitialized(privyUserId: string, username: string, privyToken: string): Promise<boolean> {
    try {
      const credentials: LoginCredentials = {
        privyUserId,
        name: username,
        privyToken
      };

      const response = await authService.login(credentials);
      return response.success && !!response.user;
    } catch {
      return false;
    }
  }
} 