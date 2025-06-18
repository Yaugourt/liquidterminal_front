"use client";

import { Message } from "@/components/types/message.types";
import { MessageDisplay } from "./MessageDisplay";

interface MessageInlineProps {
  message: Message;
  onClose?: () => void;
  className?: string;
}

export function MessageInline({ message, onClose, className }: MessageInlineProps) {
  return (
    <div className={className}>
      <MessageDisplay
        variant="inline"
        message={message}
        onClose={onClose}
      />
    </div>
  );
} 