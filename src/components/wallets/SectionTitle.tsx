interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return <h3 className={`text-white text-lg mb-4 ${className}`}>{children}</h3>;
}
