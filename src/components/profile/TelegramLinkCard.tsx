"use client";

import { memo, useMemo } from "react";
import { useTelegramLink } from "@/services/auth/telegram";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Unlink,
  AlertCircle
} from "lucide-react";

// Telegram brand icon (inline SVG)
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface TelegramLinkCardProps {
  initialTelegramUsername?: string | null;
  className?: string;
}

export const TelegramLinkCard = memo(function TelegramLinkCard({
  initialTelegramUsername,
  className
}: TelegramLinkCardProps) {
  const {
    state,
    telegramUsername,
    deepLink,
    remainingSeconds,
    startLinking,
    cancelLinking,
    unlinkTelegram,
    isGeneratingLink,
    isPolling,
    isUnlinking,
    error,
    clearError,
  } = useTelegramLink(initialTelegramUsername);

  // Format countdown display
  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  // Render error state
  if (error) {
    return (
      <div className={cn(
        "p-5 rounded-2xl",
        "bg-brand-secondary/60 backdrop-blur-md",
        "border border-rose-500/20",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-400 mb-1">
              Telegram Link Error
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              {error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render linking in progress state
  if (state === 'linking') {
    return (
      <div className={cn(
        "p-5 rounded-2xl",
        "bg-brand-secondary/60 backdrop-blur-md",
        "border border-[#0088cc]/30",
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#0088cc]/20 flex items-center justify-center">
            <TelegramIcon className="h-5 w-5 text-[#0088cc]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Link Telegram</h3>
            <p className="text-xs text-text-muted">Waiting for confirmation...</p>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-border-hover">
            <Clock className="h-3.5 w-3.5 text-brand-gold" />
            <span className={cn(
              "text-xs font-mono font-medium",
              remainingSeconds < 60 ? "text-rose-400" : "text-brand-gold"
            )}>
              {formattedCountdown}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 mb-4 rounded-xl bg-brand-dark border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            {isPolling && (
              <Loader2 className="h-4 w-4 animate-spin text-[#0088cc]" />
            )}
            <span className="text-sm text-white font-medium">
              Click the button below to open Telegram
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Press &quot;Start&quot; in the bot to complete the link. This window will update automatically.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            asChild
            className="flex-1 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-semibold"
          >
            <a
              href={deepLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TelegramIcon className="h-4 w-4 mr-2" />
              Open Telegram
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={cancelLinking}
            className="border-white/10 text-text-secondary hover:text-white hover:bg-white/5"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Render linked state
  if (state === 'linked' && telegramUsername) {
    return (
      <div className={cn(
        "p-5 rounded-2xl",
        "bg-brand-secondary/60 backdrop-blur-md",
        "border border-emerald-500/20",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TelegramIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Telegram Linked</h3>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400 font-mono">
                @{telegramUsername}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={unlinkTelegram}
            disabled={isUnlinking}
            className="text-text-muted hover:text-rose-400 hover:bg-rose-500/10"
          >
            {isUnlinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Unlink className="h-4 w-4 mr-1" />
                Unlink
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render not linked state (default)
  return (
    <div className={cn(
      "p-5 rounded-2xl",
      "bg-brand-secondary/60 backdrop-blur-md",
      "border border-border-subtle hover:border-border-hover transition-all",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0088cc]/10 flex items-center justify-center">
            <TelegramIcon className="h-5 w-5 text-[#0088cc]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Link Telegram</h3>
            <p className="text-xs text-text-muted">
              Get notifications and alerts
            </p>
          </div>
        </div>

        <Button
          onClick={startLinking}
          disabled={isGeneratingLink}
          className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-semibold"
        >
          {isGeneratingLink ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <TelegramIcon className="h-4 w-4 mr-2" />
              Connect
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
