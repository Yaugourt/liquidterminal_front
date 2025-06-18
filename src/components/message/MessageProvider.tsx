"use client";

import { useMessages } from "@/hooks/useMessages";
import { MessageToastContainer } from "./MessageToastContainer";

interface MessageProviderProps {
  children: React.ReactNode;
}

export function MessageProvider({ children }: MessageProviderProps) {
  const { messages, removeMessage } = useMessages();

  return (
    <>
      <MessageToastContainer
        messages={messages}
        onClose={removeMessage}
      />
      {children}
    </>
  );
} 