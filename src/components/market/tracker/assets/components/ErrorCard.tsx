import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorCardProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorCard({ message, variant = 'info' }: ErrorCardProps) {
  const colors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-white'
  };

  return (
    <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
      <CardContent className="p-4">
        <div className={`flex items-center justify-center ${colors[variant]} space-x-2`}>
          <AlertCircle className="h-5 w-5" />
          <span>{message}</span>
        </div>
      </CardContent>
    </Card>
  );
} 