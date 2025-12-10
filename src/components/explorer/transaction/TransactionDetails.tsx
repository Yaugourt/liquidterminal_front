import { Card } from "@/components/ui/card";
import { FormattedTransactionData, FormattedTransactionField } from '@/services/explorer/types';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface TransactionDetailsProps {
  data: FormattedTransactionData;
}

export function TransactionDetails({ data }: TransactionDetailsProps) {
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

  const renderFieldValue = (field: FormattedTransactionField) => {
    if (field.value === null || field.value === undefined) {
      return <span className="text-[#FFFFFF80]">-</span>;
    }

    const stringValue = String(field.value);

    switch (field.type) {
      case 'boolean':
        return (
          <span className={`${field.value ? 'text-green-400' : 'text-red-400'} font-inter`}>
            {field.value ? 'Yes' : 'No'}
          </span>
        );

      case 'address':
        return (
          <div className="flex items-center gap-2">
            <Link 
              href={`/explorer/address/${stringValue}`}
              className="text-brand-accent hover:text-brand-accent/80 transition-colors font-inter"
            >
              {stringValue.length > 20 
                ? `${stringValue.substring(0, 8)}...${stringValue.substring(stringValue.length - 8)}`
                : stringValue
              }
            </Link>
            <button
              onClick={() => copyToClipboard(stringValue)}
              className="p-1 hover:bg-[#FFFFFF0A] rounded transition-colors"
            >
              {copiedValue === stringValue ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-brand-gold opacity-60 hover:opacity-100" />
              )}
            </button>
          </div>
        );

      case 'hash':
        return (
          <div className="flex items-center gap-2">
            <span className="text-brand-accent font-inter">
              {stringValue.length > 20 
                ? `${stringValue.substring(0, 8)}...${stringValue.substring(stringValue.length - 8)}`
                : stringValue
              }
            </span>
            <button
              onClick={() => copyToClipboard(stringValue)}
              className="p-1 hover:bg-[#FFFFFF0A] rounded transition-colors"
            >
              {copiedValue === stringValue ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-brand-gold opacity-60 hover:opacity-100" />
              )}
            </button>
          </div>
        );

      case 'amount':
        return (
          <span className="text-[#F9E370] font-inter">
            {typeof field.value === 'number' 
              ? field.value.toLocaleString() 
              : stringValue
            }
          </span>
        );

      case 'link':
        return (
          <Link 
            href={stringValue}
            className="text-brand-accent hover:text-brand-accent/80 transition-colors underline font-inter"
          >
            {stringValue}
          </Link>
        );

      case 'json':
        return (
          <pre className="text-[#FFFFFF] bg-[#FFFFFF0A] p-2 rounded text-xs overflow-x-auto font-inter">
            {stringValue}
          </pre>
        );

      default:
        return (
          <span className="text-white font-inter">
            {stringValue}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {data.sections.map((section, sectionIndex) => (
        <Card 
          key={sectionIndex}
          className="bg-[#051728CC] border-2 border-[#83E9FF4D] p-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]"
        >
          <h3 className="text-xl text-white font-medium p-6 bg-brand-tertiary border-b border-[#FFFFFF1A] rounded-t-xl font-inter">
            {section.title}
          </h3>
          
          <div className="p-6">
            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="text-[#FFFFFF80] text-sm font-medium min-w-[150px] font-inter">
                    {field.label}:
                  </div>
                  <div className="flex-1 text-right sm:text-left">
                    {renderFieldValue(field)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 