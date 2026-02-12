// ==================== REPONSES API ====================

/**
 * Response from POST /auth/telegram/generate-link
 * Contains the deep link and verification code for Telegram linking
 */
export interface TelegramGenerateLinkResponse {
  success: boolean;
  message?: string;
  data: {
    code: string;
    deepLink: string;
    expiresIn: number; // seconds until expiration
  };
}

/**
 * Response from GET /auth/telegram/link-status/:code
 * Polling endpoint to check if user completed Telegram linking
 */
export interface TelegramLinkStatusResponse {
  success: boolean;
  message?: string;
  data: {
    linked: boolean;
    telegramUsername?: string; // Only present when linked=true
  };
}

/**
 * Response from DELETE /auth/telegram/unlink
 */
export interface TelegramUnlinkResponse {
  success: boolean;
  message: string;
}

// ==================== ETATS UI ====================

/**
 * Telegram link state for the UI
 */
export type TelegramLinkState =
  | 'not_linked'      // No Telegram account linked
  | 'linking'         // User initiated linking, polling in progress
  | 'linked'          // Successfully linked
  | 'error';          // An error occurred

// ==================== CODES ERREUR ====================

/**
 * Error codes for Telegram linking operations
 */
export type TelegramErrorCode =
  | 'TELEGRAM_ALREADY_LINKED'      // User already has Telegram linked
  | 'CODE_EXPIRED'                 // The verification code expired
  | 'INVALID_CODE'                 // Invalid verification code
  | 'TELEGRAM_ACCOUNT_NOT_LINKED'  // No Telegram account linked (for unlink)
  | 'UNAUTHORIZED'                 // User not authenticated
  | 'NETWORK_ERROR'                // Network/connection error
  | 'UNKNOWN_ERROR';               // Generic error

/**
 * Structured error for Telegram operations
 */
export interface TelegramError {
  code: TelegramErrorCode;
  message: string;
}

// ==================== RESULTAT HOOK ====================

/**
 * Full state returned by useTelegramLink hook
 */
export interface UseTelegramLinkResult {
  // Current state
  state: TelegramLinkState;
  telegramUsername: string | null;

  // Linking flow state
  deepLink: string | null;
  code: string | null;
  expiresAt: Date | null;
  remainingSeconds: number;

  // Actions
  startLinking: () => Promise<void>;
  cancelLinking: () => void;
  unlinkTelegram: () => Promise<void>;

  // Loading/error states
  isGeneratingLink: boolean;
  isPolling: boolean;
  isUnlinking: boolean;
  error: TelegramError | null;
  clearError: () => void;
}
