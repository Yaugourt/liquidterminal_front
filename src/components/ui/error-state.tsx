"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
    /** Si true, enveloppe le contenu dans une Card */
    withCard?: boolean;
}

export function ErrorState({
    title = "An error occurred",
    message,
    onRetry,
    className,
    withCard = true,
}: ErrorStateProps) {
    const content = (
        <div className={cn(
            "flex flex-col items-center justify-center text-center px-4 py-8 w-full h-[300px]",
            className
        )}>
            <AlertCircle className="w-12 h-12 mb-4 text-rose-500/50" />
            <p className="text-rose-400 text-lg font-medium mb-2">{title}</p>
            {message && (
                <p className="text-text-muted text-sm mb-4">{message}</p>
            )}
            {onRetry && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="mt-2"
                >
                    Retry
                </Button>
            )}
        </div>
    );

    if (withCard) {
        return <Card className="w-full">{content}</Card>;
    }

    return content;
}
