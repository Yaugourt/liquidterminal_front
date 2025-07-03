import { Database, Loader2 } from "lucide-react";
import { StateComponentProps } from "./types";

const baseContainerClasses = "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent";
const baseContentClasses = "flex flex-col items-center justify-center";
const baseIconClasses = "w-10 h-10 mb-4 text-[#83E9FF4D]";
const baseTextClasses = "text-white text-lg";

export function LoadingState({ message = "Chargement..." }: StateComponentProps) {
  return (
    <div className={baseContainerClasses}>
      <div className={baseContentClasses}>
        <Loader2 className={`${baseIconClasses} animate-spin`} />
        <p className={baseTextClasses}>{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message = "Une erreur est survenue" }: StateComponentProps) {
  return (
    <div className={baseContainerClasses}>
      <div className={baseContentClasses}>
        <Database className={baseIconClasses} />
        <p className={baseTextClasses}>{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ 
  message = "No data available" 
}: StateComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Database className={baseIconClasses} />
      <p className={`${baseTextClasses} font-inter`}>{message}</p>
      <p className="text-[#FFFFFF80] text-sm mt-2">
        Check back later for updated market information
      </p>
    </div>
  );
} 