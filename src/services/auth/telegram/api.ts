import { post, get, del } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import {
  TelegramGenerateLinkResponse,
  TelegramLinkStatusResponse,
  TelegramUnlinkResponse
} from './types';

/**
 * Generate a Telegram deep link for account linking
 * User must be authenticated (JWT auto-injected by interceptor)
 * @returns Deep link URL and verification code
 */
export const generateTelegramLink = async (): Promise<TelegramGenerateLinkResponse> => {
  return withErrorHandling(async () => {
    return await post<TelegramGenerateLinkResponse>(
      '/auth/telegram/generate-link',
      {},
      { useCache: false } // Never cache this - always fresh link
    );
  }, 'generating Telegram link');
};

/**
 * Check the status of a Telegram link verification code
 * Used for polling during the linking process
 * @param code - The verification code from generateTelegramLink
 * @returns Whether the account is linked and the username if available
 */
export const getTelegramLinkStatus = async (code: string): Promise<TelegramLinkStatusResponse> => {
  return withErrorHandling(async () => {
    return await get<TelegramLinkStatusResponse>(
      `/auth/telegram/link-status/${code}`,
      undefined,
      { useCache: false } // Never cache - status changes
    );
  }, 'checking Telegram link status');
};

/**
 * Unlink the user's Telegram account
 * @returns Success message
 */
export const unlinkTelegram = async (): Promise<TelegramUnlinkResponse> => {
  return withErrorHandling(async () => {
    return await del<TelegramUnlinkResponse>('/auth/telegram/unlink');
  }, 'unlinking Telegram account');
};
