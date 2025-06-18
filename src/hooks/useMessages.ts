import { Message, MessageType } from "@/components/types/message.types";
import { DEFAULT_MESSAGES, MESSAGE_CODES } from "@/constants/messages";
import { create } from "zustand";

interface MessagesState {
  messages: Message[];
  addMessage: (message: Omit<Message, "id">) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

const useMessagesStore = create<MessagesState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
    })),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
  clearMessages: () => set({ messages: [] }),
}));

export function useMessages() {
  const { messages, addMessage, removeMessage, clearMessages } = useMessagesStore();

  const createMessage = (
    type: MessageType,
    content: string,
    options?: Partial<Omit<Message, "id" | "type" | "content">>
  ) => {
    addMessage({
      type,
      content,
      ...options,
    });
  };

  const showSuccess = (
    content: string,
    options?: Partial<Omit<Message, "id" | "type" | "content">>
  ) => {
    createMessage("success", content, options);
  };

  const showError = (
    content: string,
    options?: Partial<Omit<Message, "id" | "type" | "content">>
  ) => {
    createMessage("error", content, options);
  };

  const showWarning = (
    content: string,
    options?: Partial<Omit<Message, "id" | "type" | "content">>
  ) => {
    createMessage("warning", content, options);
  };

  const showInfo = (
    content: string,
    options?: Partial<Omit<Message, "id" | "type" | "content">>
  ) => {
    createMessage("info", content, options);
  };

  const showPredefined = (
    messageCode: keyof typeof MESSAGE_CODES,
    options?: Partial<Omit<Message, "id" | "type" | "content" | "title">>
  ) => {
    const code = MESSAGE_CODES[messageCode];
    const predefinedMessage = DEFAULT_MESSAGES[code];
    if (!predefinedMessage) {
      console.warn(`No predefined message found for code: ${code}`);
      return;
    }

    const type = messageCode.startsWith("TX_SUCCESS") || messageCode.startsWith("AUTH_SUCCESS")
      ? "success"
      : messageCode.includes("ERROR") || messageCode.includes("FAILED")
      ? "error"
      : messageCode.includes("CONGESTED") || messageCode.includes("PENDING")
      ? "warning"
      : "info";

    addMessage({
      type,
      ...predefinedMessage,
      ...options
    });
  };

  return {
    messages,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPredefined,
    removeMessage,
    clearMessages,
  };
} 