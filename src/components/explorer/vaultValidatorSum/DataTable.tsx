import { Loader2, Database } from "lucide-react";

export function DataTable({ isLoading, error, emptyMessage, children }: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
          <span className="text-[#FFFFFF80] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-[#FF5757] text-lg mb-2">Une erreur est survenue</p>
          <p className="text-[#FFFFFF80] text-sm">{error.message || "Une erreur est survenue"}</p>
        </div>
      </div>
    );
  }

  if (!children) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-white text-lg mb-2">{emptyMessage}</p>
          <p className="text-[#FFFFFF80] text-sm">Revenez plus tard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
      <table className="w-full text-sm text-white font-inter">
        {children}
      </table>
    </div>
  );
} 