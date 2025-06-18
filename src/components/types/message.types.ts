export type MessageType = 'success' | 'error' | 'warning' | 'info';
export type MessageVariant = 'toast' | 'inline' | 'fullpage';

export interface Message {
  id: string;
  type: MessageType;
  title?: string;
  content: string;
  code?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface MessageDisplayProps {
  variant: MessageVariant;
  message: Message;
  onClose?: () => void;
} 