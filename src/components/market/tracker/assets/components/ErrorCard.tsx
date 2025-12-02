import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorCard({ message, variant = 'info' }: ErrorCardProps) {
  const colors = {
    error: 'text-rose-400',
    warning: 'text-amber-400',
    info: 'text-zinc-400'
  };

  return (
    <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
      <div className="p-6">
        <div className={`flex items-center justify-center ${colors[variant]} space-x-2`}>
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
} 