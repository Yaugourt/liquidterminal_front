"use client";

import { Message } from "@/components/types/message.types";
import { MessageToast } from "./MessageToast";
import { AnimatePresence, motion } from "framer-motion";

interface MessageToastContainerProps {
  messages: Message[];
  onClose: (id: string) => void;
}

export function MessageToastContainer({ messages, onClose }: MessageToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <MessageToast
              message={message}
              onClose={() => onClose(message.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 