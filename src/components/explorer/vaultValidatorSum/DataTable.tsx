import { Loader2, Database } from "lucide-react";
import { Table } from "@/components/ui/table";

interface DataTableProps {
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  children: React.ReactNode;
}

export function DataTable({ isLoading, error, emptyMessage, children }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
          <span className="text-zinc-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-10 h-10 mb-3 text-rose-400" />
          <p className="text-rose-400 text-sm mb-1">An error occurred</p>
          <p className="text-zinc-500 text-xs">{error.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  if (!children) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-10 h-10 mb-3 text-zinc-600" />
          <p className="text-zinc-400 text-sm mb-1">{emptyMessage}</p>
          <p className="text-zinc-600 text-xs">Come back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <Table className="w-full text-sm text-white font-inter">
        {children}
      </Table>
    </div>
  );
} 