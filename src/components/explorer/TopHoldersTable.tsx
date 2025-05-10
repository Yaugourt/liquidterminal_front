import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, Loader2 } from "lucide-react";

// Type pour les données des holders
interface Holder {
  address: string;
  balance: string;
  percentage: number;
  transactions: number;
}

export function TopHoldersTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [holders, setHolders] = useState<Holder[]>([]);

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setHolders([
        {
          address: "0x8945cAb1eBF1b0Ec2d63697f27c0E2A2F6092910",
          balance: "134,568,927.53",
          percentage: 12.4,
          transactions: 1432
        },
        {
          address: "0xCd3B766CcDd6Ae4f2982b3b642C82f4C3073365F",
          balance: "87,345,123.78",
          percentage: 8.1,
          transactions: 947 
        },
        {
          address: "0xa7E2f1c28Ce49A24E1CC814a949580C2C2529C10",
          balance: "56,471,892.12",
          percentage: 5.2,
          transactions: 658
        },
        {
          address: "0x22e718C22e3EB733e628a5F953546026C8F3E368",
          balance: "43,218,764.35",
          percentage: 4.0,
          transactions: 521
        },
        {
          address: "0xF01b78D27684AD5F50699a59187D1Be4352E59Ce",
          balance: "28,974,351.67",
          percentage: 2.7,
          transactions: 346
        },
      ]);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fonction pour tronquer les adresses
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="bg-[#051728E5] rounded-xl border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#83E9FF33]">
        <div className="flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-[#83E9FF]" />
          <h3 className="text-white text-lg font-medium">Top Holders</h3>
        </div>
        <Badge variant="outline" className="bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]">
          <div className="flex items-center">
            <span className="mr-1 text-xs">●</span>
            Connected
          </div>
        </Badge>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#83E9FF]" />
          </div>
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-[#FFFFFF1A] hover:bg-transparent">
                <TableHead className="text-[#FFFFFF99] font-normal w-[40%]">Address</TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal text-right">Balance</TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal text-right">Percentage</TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal text-right">Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holders.map((holder, index) => (
                <TableRow 
                  key={index} 
                  className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
                >
                  <TableCell className="text-[#83E9FF] font-mono text-sm">
                    {truncateAddress(holder.address)}
                  </TableCell>
                  <TableCell className="text-white text-right">
                    {holder.balance}
                  </TableCell>
                  <TableCell className="text-white text-right">
                    {holder.percentage}%
                  </TableCell>
                  <TableCell className="text-white text-right">
                    {holder.transactions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
} 