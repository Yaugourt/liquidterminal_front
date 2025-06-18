"use client";

import { MessageFullPage } from "@/components/message/MessageFullPage";
import { DEFAULT_MESSAGES, MESSAGE_CODES } from "@/constants/messages";
import { Message } from "@/components/types/message.types";

interface LoadingStateProps {
  message?: string;
  customTitle?: string;
  showHeader?: boolean;
}

export function LoadingState({ 
  message = DEFAULT_MESSAGES[MESSAGE_CODES.DATA_LOADING].content,
  customTitle,
  showHeader = true
}: LoadingStateProps) {
  const loadingMessage: Omit<Message, "id"> = {
    type: "info",
    content: message,
    title: DEFAULT_MESSAGES[MESSAGE_CODES.DATA_LOADING].title
  };

  return (
    <MessageFullPage
      message={{ ...loadingMessage, id: "loading-state" }}
      customTitle={customTitle}
      showHeader={showHeader}
    />
  );
}

interface ErrorStateProps {
  message?: string;
  customTitle?: string;
  showHeader?: boolean;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = DEFAULT_MESSAGES[MESSAGE_CODES.DATA_ERROR].content,
  customTitle,
  showHeader = true,
  onRetry
}: ErrorStateProps) {
  const errorMessage: Omit<Message, "id"> = {
    type: "error",
    content: message,
    title: DEFAULT_MESSAGES[MESSAGE_CODES.DATA_ERROR].title,
    action: onRetry ? {
      label: "Retry",
      onClick: onRetry
    } : undefined
  };

  return (
    <MessageFullPage
      message={{ ...errorMessage, id: "error-state" }}
      customTitle={customTitle}
      showHeader={showHeader}
    />
  );
} 