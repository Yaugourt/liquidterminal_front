import { useState, useCallback } from 'react';

interface UsePaginationOptions {
    initialPage?: number;
    initialRowsPerPage?: number;
}

export interface UsePaginationReturn {
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    setPage: (page: number) => void;
    setRowsPerPage: (rowsPerPage: number) => void;
    startIndex: number;
    endIndex: number;
}

export function usePagination({
    initialPage = 0,
    initialRowsPerPage = 10
}: UsePaginationOptions = {}): UsePaginationReturn {
    const [page, setPage] = useState(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const onPageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const onRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page when changing page size
    }, []);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return {
        page,
        rowsPerPage,
        onPageChange,
        onRowsPerPageChange,
        setPage,
        setRowsPerPage,
        startIndex,
        endIndex,
    };
}
