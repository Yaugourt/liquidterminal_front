import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { ExtendedTransactionDetails } from '@/services/explorer/types';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { truncateAddress } from '@/lib/formatters/numberFormatting';

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
    } catch {
      // Error handled silently
    }
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-text-primary text-sm mb-1 font-inter">Type:</p>
            <p className="text-text-primary text-base font-inter">
              {transaction.action.type}
            </p>
          </div>
          <div>
            <p className="text-text-primary text-sm mb-1 font-inter">Time:</p>
            <p className="text-text-primary text-base font-inter">
              {format(new Date(transaction.time), 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-text-primary text-sm mb-1 font-inter">Block:</p>
            <Link
              href={`/explorer/block/${transaction.block}`}
              className="text-gold text-base hover:text-gold/80 transition-colors font-inter"
            >
              {transaction.block}
            </Link>
          </div>
          <div>
            <p className="text-text-primary text-sm mb-1 font-inter">User:</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/explorer/address/${transaction.user}`}
                className="text-brand text-base hover:text-brand/80 transition-colors"
              >
                <span className="md:hidden">{truncateAddress(transaction.user)}</span>
                <span className="hidden md:inline">{transaction.user}</span>
              </Link>
              <button
                onClick={() => copyToClipboard(transaction.user)}
                className="p-1 hover:bg-white/4 rounded transition-colors"
              >
                {copiedValue === transaction.user ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3 text-gold opacity-60 hover:opacity-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {transaction.error && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p className="text-text-primary text-sm mb-1 font-inter">Error:</p>
          <p className="text-danger text-sm font-inter">{transaction.error}</p>
        </div>
      )}
    </Card>
  );
} 