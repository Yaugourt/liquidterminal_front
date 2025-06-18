"use client";

import { Message } from "@/components/types/message.types";
import { MessageDisplay } from "./MessageDisplay";

interface MessageFullPageProps {
  message: Message;
  onClose?: () => void;
  showHeader?: boolean;
  customTitle?: string;
}

export function MessageFullPage({ 
  message, 
  onClose,
  showHeader = true,
  customTitle
}: MessageFullPageProps) {
  return (
    <div className="min-h-screen">
      {showHeader && (
        <div className="p-4 border-b border-[#FFFFFF1A]">
          <h1 className="text-xl text-white font-medium">
            {customTitle || "Liquid Terminal"}
          </h1>
        </div>
      )}
      
      <div className="min-h-[calc(100vh-73px)] p-4 lg:p-12 flex items-center justify-center">
        <MessageDisplay
          variant="fullpage"
          message={message}
          onClose={onClose}
        />
      </div>
    </div>
  );
} 