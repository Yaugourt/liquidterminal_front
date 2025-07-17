import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { ExtendedTransactionDetails } from '@/services/explorer/types';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TransactionHeaderProps {
  transaction: ExtendedTransactionDetails;
}

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(text);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length > 16) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-white text-sm mb-1 font-inter">Type:</p>
            <p className="text-white text-base font-inter">
              {transaction.action.type}
            </p>
          </div>
          <div>
            <p className="text-white text-sm mb-1 font-inter">Time:</p>
            <p className="text-white text-base font-inter">
              {format(new Date(transaction.time), 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-white text-sm mb-1 font-inter">Block:</p>
            <Link 
              href={`/explorer/block/${transaction.block}`}
              className="text-[#F9E370] text-base hover:text-[#F9E370]/80 transition-colors font-inter"
            >
              {transaction.block}
            </Link>
          </div>
          <div>
            <p className="text-white text-sm mb-1 font-inter">User:</p>
            <div className="flex items-center gap-2">
              <Link 
                href={`/explorer/address/${transaction.user}`}
                className="text-[#83E9FF] text-base hover:text-[#83E9FF]/80 transition-colors font-inter"
              >
                <span className="md:hidden">{truncateAddress(transaction.user)}</span>
                <span className="hidden md:inline">{transaction.user}</span>
              </Link>
              <button
                onClick={() => copyToClipboard(transaction.user)}
                className="p-1 hover:bg-[#FFFFFF0A] rounded transition-colors"
              >
                {copiedValue === transaction.user ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-[#f9e370] opacity-60 hover:opacity-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {transaction.error && (
        <div className="mt-4 p-3 bg-[#FF000033] border border-[#FF000066] rounded-lg">
          <p className="text-white text-sm mb-1 font-inter">Error:</p>
          <p className="text-[#FF6B6B] text-sm font-inter">{transaction.error}</p>
        </div>
      )}
    </Card>
  );
} 