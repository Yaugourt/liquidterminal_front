"use client";

import { MessageDisplayProps } from "@/components/types/message.types";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageDisplay({ variant, message, onClose }: MessageDisplayProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-[#FF6B6B]" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-[#FFB02E]" />;
      case 'info':
        return <Info className="h-5 w-5 text-[#83E9FF]" />;
    }
  };

  const getColors = () => {
    switch (message.type) {
      case 'success':
        return 'bg-[#4ADE8033] text-[#4ADE80] border-[#4ADE80]';
      case 'error':
        return 'bg-[#FF000033] text-[#FF6B6B] border-[#FF6B6B]';
      case 'warning':
        return 'bg-[#FFB02E33] text-[#FFB02E] border-[#FFB02E]';
      case 'info':
        return 'bg-[#83E9FF33] text-[#83E9FF] border-[#83E9FF]';
    }
  };

  const getContainerStyles = () => {
    const baseStyles = `flex items-center p-4 rounded-lg border ${getColors()}`;
    
    switch (variant) {
      case 'toast':
        return `${baseStyles} fixed top-4 right-4 max-w-md shadow-lg z-50`;
      case 'inline':
        return `${baseStyles} w-full`;
      case 'fullpage':
        return `${baseStyles} fixed inset-0 m-auto h-fit max-w-lg shadow-lg z-50`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className={getContainerStyles()}>
      <span className="mr-3 flex-shrink-0">{getIcon()}</span>
      
      <div className="flex-1 min-w-0">
        {message.title && (
          <h4 className="font-medium mb-1 text-sm">{message.title}</h4>
        )}
        <p className="text-sm opacity-90 break-words">{message.content}</p>
      </div>

      {message.action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={message.action.onClick}
          className="ml-4 hover:bg-white/10"
        >
          {message.action.label}
        </Button>
      )}

      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ml-2 h-6 w-6 hover:bg-white/10"
        >
          <X className="h-4 w-4 opacity-60 hover:opacity-100" />
        </Button>
      )}
    </div>
  );
} 