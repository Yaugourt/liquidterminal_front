"use client";

import { ReactNode } from "react";
import { Loader2, Database, AlertCircle } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableEmptyStateProps {
    colSpan: number;
    title?: string;
    description?: string;
    icon?: ReactNode;
}

/**
 * État vide pour les tableaux - utilise TableRow/TableCell
 */
export function TableEmptyState({
    colSpan,
    title = "No data available",
    description = "Check back later",
    icon,
}: TableEmptyStateProps) {
    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                    {icon || <Database className="w-10 h-10 mb-3 text-text-muted" />}
                    <p className="text-text-secondary text-sm mb-1">{title}</p>
                    <p className="text-text-muted text-xs">{description}</p>
                </div>
            </TableCell>
        </TableRow>
    );
}

interface TableLoadingStateProps {
    colSpan: number;
    rows?: number;
    variant?: "spinner" | "skeleton";
}

/**
 * État de chargement pour les tableaux - utilise TableRow/TableCell
 */
export function TableLoadingState({
    colSpan,
    rows = 5,
    variant = "skeleton",
}: TableLoadingStateProps) {
    if (variant === "spinner") {
        return (
            <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 mb-3 text-brand-accent animate-spin" />
                        <p className="text-text-muted text-sm">Loading...</p>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                    {Array.from({ length: colSpan }).map((_, j) => (
                        <TableCell key={j} className="px-4">
                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

interface TableErrorStateProps {
    colSpan: number;
    title?: string;
    message?: string;
}

/**
 * État d'erreur pour les tableaux - utilise TableRow/TableCell
 */
export function TableErrorState({
    colSpan,
    title = "An error occurred",
    message,
}: TableErrorStateProps) {
    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-10 h-10 mb-3 text-rose-500/50" />
                    <p className="text-rose-400 text-sm mb-1">{title}</p>
                    {message && (
                        <p className="text-text-muted text-xs">{message}</p>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
