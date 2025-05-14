import { Card } from "@/components/ui/card";
import { 
  Blocks, 
  Clock, 
  ArrowRightLeft, 
  Users, 
  LucideIcon
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  type: 'block' | 'blockTime' | 'transactions' | 'users';
}

export function StatsCard({ title, value, type }: StatsCardProps) {
  // Sélectionner l'icône appropriée selon le type
  const iconMap: Record<string, LucideIcon> = {
    block: Blocks,
    blockTime: Clock,
    transactions: ArrowRightLeft,
    users: Users
  };
  
  const Icon = iconMap[type] || Blocks;
  
  // Formatter la valeur pour une meilleure lisibilité
  const formattedValue = value.includes(',') 
    ? value 
    : value.includes('.') 
      ? value.replace(/\./g, ',') 
      : value;
  
  return (
    <Card className="p-4 bg-[#051728E5] w-full border border-[#83E9FF4D] rounded-xl shadow-sm hover:border-[#83E9FF80] transition-all">
      <div className="flex items-center">
        <div className="bg-[#083050] p-2 rounded-lg mr-3">
          <Icon size={16} className="text-[#83E9FF]" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs   text-[#FFFFFF99] font-serif">
            {title}
          </h3>
          <p className="text-xl text-white">{formattedValue}</p>
        </div>
      </div>
    </Card>
  );
}
