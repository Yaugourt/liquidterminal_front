import { ReactNode } from "react";
import { Loader2, Database, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
    isLoading?: boolean;
    error?: Error | null;
    isEmpty?: boolean;
    emptyState?: {
        title?: string;
        description?: string;
        icon?: ReactNode;
        action?: ReactNode;
    };
    children: ReactNode;
    className?: string;
    loadingMessage?: string;
    errorMessage?: string;
}

export function DataTable({
    isLoading,
    error,
    isEmpty,
    emptyState,
    children,
    className,
    loadingMessage = "Loading...",
    errorMessage = "An error occurred"
}: DataTableProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[300px] w-full">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
                    <span className="text-[#FFFFFF80] text-sm">{loadingMessage}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[300px] w-full">
                <div className="flex flex-col items-center text-center px-4">
                    <AlertCircle className="w-12 h-12 mb-4 text-rose-500/50" />
                    <p className="text-rose-400 text-lg mb-2">{errorMessage}</p>
                    <p className="text-[#FFFFFF80] text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="flex justify-center items-center h-[300px] w-full">
                <div className="flex flex-col items-center text-center px-4">
                    <div className="w-16 h-16 mb-4 bg-[#83E9FF]/10 rounded-2xl flex items-center justify-center">
                        {emptyState?.icon || <Database className="w-8 h-8 text-[#83E9FF]" />}
                    </div>
                    <p className="text-white text-lg mb-2">{emptyState?.title || "No data available"}</p>
                    <p className="text-[#FFFFFF80] text-sm mb-4">{emptyState?.description || "There is no data to display at this time."}</p>
                    {emptyState?.action}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent", className)}>
            {children}
        </div>
    );
}
