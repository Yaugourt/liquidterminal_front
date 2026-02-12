import { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { generateTelegramLink, getTelegramLinkStatus, unlinkTelegram } from '../api';
import {
  TelegramLinkState,
  TelegramError,
  TelegramErrorCode,
  UseTelegramLinkResult
} from '../types';

// Polling interval: 2 seconds
const POLLING_INTERVAL = 2000;

interface StandardError {
  message: string;
  code?: string;
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
    };
  };
}

/**
 * Maps API error codes to TelegramErrorCode
 */
function mapErrorCode(error: StandardError): TelegramErrorCode {
  const responseCode = error.response?.data?.code;

  switch (responseCode) {
    case 'TELEGRAM_ALREADY_LINKED':
      return 'TELEGRAM_ALREADY_LINKED';
    case 'CODE_EXPIRED':
      return 'CODE_EXPIRED';
    case 'INVALID_CODE':
      return 'INVALID_CODE';
    case 'TELEGRAM_ACCOUNT_NOT_LINKED':
      return 'TELEGRAM_ACCOUNT_NOT_LINKED';
    default:
      if (error.code === 'UNAUTHORIZED' || error.response?.status === 401) {
        return 'UNAUTHORIZED';
      }
      if (error.code === 'NETWORK_ERROR') {
        return 'NETWORK_ERROR';
      }
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Gets user-friendly error message
 */
function getErrorMessage(code: TelegramErrorCode): string {
  switch (code) {
    case 'TELEGRAM_ALREADY_LINKED':
      return 'Your account is already linked to Telegram.';
    case 'CODE_EXPIRED':
      return 'The verification code has expired. Please try again.';
    case 'INVALID_CODE':
      return 'Invalid verification code.';
    case 'TELEGRAM_ACCOUNT_NOT_LINKED':
      return 'No Telegram account is linked.';
    case 'UNAUTHORIZED':
      return 'You must be logged in to link Telegram.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Hook for managing Telegram account linking flow
 * Handles link generation, polling, countdown timer, and unlinking
 */
export function useTelegramLink(
  initialTelegramUsername?: string | null
): UseTelegramLinkResult {
  const { authenticated, ready } = usePrivy();

  // State
  const [state, setState] = useState<TelegramLinkState>(
    initialTelegramUsername ? 'linked' : 'not_linked'
  );
  const [telegramUsername, setTelegramUsername] = useState<string | null>(
    initialTelegramUsername || null
  );
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Loading states
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Error state
  const [error, setError] = useState<TelegramError | null>(null);

  // Refs for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Update initial state when prop changes
  useEffect(() => {
    if (initialTelegramUsername) {
      setState('linked');
      setTelegramUsername(initialTelegramUsername);
    }
  }, [initialTelegramUsername]);

  /**
   * Cancel the linking process - defined before countdown effect
   */
  const cancelLinking = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setIsPolling(false);
    setDeepLink(null);
    setCode(null);
    setExpiresAt(null);
    setRemainingSeconds(0);
    setState(telegramUsername ? 'linked' : 'not_linked');
  }, [telegramUsername]);

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt || state !== 'linking') {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

      if (!mountedRef.current) return;

      setRemainingSeconds(diff);

      // If expired, stop linking
      if (diff <= 0) {
        cancelLinking();
        setError({
          code: 'CODE_EXPIRED',
          message: getErrorMessage('CODE_EXPIRED')
        });
        setState('error');
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [expiresAt, state, cancelLinking]);

  /**
   * Start the Telegram linking process
   * Generates a link and begins polling for completion
   */
  const startLinking = useCallback(async () => {
    if (!authenticated || !ready) {
      setError({
        code: 'UNAUTHORIZED',
        message: getErrorMessage('UNAUTHORIZED')
      });
      setState('error');
      return;
    }

    try {
      setIsGeneratingLink(true);
      setError(null);

      const response = await generateTelegramLink();

      if (!mountedRef.current) return;

      if (!response.success || !response.data) {
        throw { code: 'UNKNOWN_ERROR', message: response.message || 'Failed to generate link' };
      }

      const { code: verificationCode, deepLink: link, expiresIn } = response.data;

      setCode(verificationCode);
      setDeepLink(link);
      setExpiresAt(new Date(Date.now() + expiresIn * 1000));
      setState('linking');
      setIsPolling(true);

      // Start polling
      pollingIntervalRef.current = setInterval(async () => {
        if (!mountedRef.current) return;

        try {
          const statusResponse = await getTelegramLinkStatus(verificationCode);

          if (!mountedRef.current) return;

          if (statusResponse.success && statusResponse.data.linked) {
            // Successfully linked!
            setTelegramUsername(statusResponse.data.telegramUsername || null);
            setState('linked');
            setIsPolling(false);
            setDeepLink(null);
            setCode(null);
            setExpiresAt(null);

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (pollError) {
          // Don't stop polling on individual poll errors
          // unless it's a fatal error like invalid code
          const standardError = pollError as StandardError;
          const errorCode = mapErrorCode(standardError);

          if (errorCode === 'CODE_EXPIRED' || errorCode === 'INVALID_CODE') {
            if (mountedRef.current) {
              cancelLinking();
              setError({
                code: errorCode,
                message: getErrorMessage(errorCode)
              });
              setState('error');
            }
          }
        }
      }, POLLING_INTERVAL);

    } catch (err) {
      if (!mountedRef.current) return;

      const standardError = err as StandardError;
      const errorCode = mapErrorCode(standardError);

      setState('error');
      setError({
        code: errorCode,
        message: standardError.message || getErrorMessage(errorCode)
      });
    } finally {
      if (mountedRef.current) {
        setIsGeneratingLink(false);
      }
    }
  }, [authenticated, ready, cancelLinking]);

  /**
   * Unlink the Telegram account
   */
  const unlinkTelegramAccount = useCallback(async () => {
    try {
      setIsUnlinking(true);
      setError(null);

      const response = await unlinkTelegram();

      if (!mountedRef.current) return;

      if (response.success) {
        setTelegramUsername(null);
        setState('not_linked');
      } else {
        throw { code: 'UNKNOWN_ERROR', message: response.message };
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const standardError = err as StandardError;
      const errorCode = mapErrorCode(standardError);
      setError({
        code: errorCode,
        message: standardError.message || getErrorMessage(errorCode)
      });
      setState('error');
    } finally {
      if (mountedRef.current) {
        setIsUnlinking(false);
      }
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error') {
      setState(telegramUsername ? 'linked' : 'not_linked');
    }
  }, [state, telegramUsername]);

  return {
    state,
    telegramUsername,
    deepLink,
    code,
    expiresAt,
    remainingSeconds,
    startLinking,
    cancelLinking,
    unlinkTelegram: unlinkTelegramAccount,
    isGeneratingLink,
    isPolling,
    isUnlinking,
    error,
    clearError,
  };
}
