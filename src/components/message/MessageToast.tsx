"use client";

import { Message } from "@/components/types/message.types";
import { MessageDisplay } from "./MessageDisplay";
import { useEffect } from "react";

interface MessageToastProps {
  message: Message;
  onClose: () => void;
}

export function MessageToast({ message, onClose }: MessageToastProps) {
  // Auto-close after duration if specified
  useEffect(() => {
    if (message.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, message.duration);

      return () => clearTimeout(timer);
    }
  }, [message.duration, onClose]);

  return (
    <MessageDisplay
      variant="toast"
      message={message}
      onClose={onClose}
    />
  );
} 