import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h3 className={cn(
      "text-lg font-medium text-white mb-4 flex items-center",
      "before:content-[''] before:h-4 before:w-1 before:bg-[#1692AD] before:mr-2 before:rounded",
      className
    )}>
      {children}
    </h3>
  );
}
