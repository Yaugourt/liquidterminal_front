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
      return <span className="text-secondary">-</span>;
    }

    const stringValue = String(field.value);

    switch (field.type) {
      case 'boolean':
        return (
          <span className={`${field.value ? 'text-success' : 'text-danger'} font-inter`}>
            {field.value ? 'Yes' : 'No'}
          </span>
        );

      case 'address':
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/explorer/address/${stringValue}`}
              className="text-brand hover:text-brand/80 transition-colors"
            >
              {stringValue.length > 20
                ? `${stringValue.substring(0, 8)}...${stringValue.substring(stringValue.length - 8)}`
                : stringValue
              }
            </Link>
            <button
              onClick={() => copyToClipboard(stringValue)}
              className="p-1 hover:bg-white/4 rounded transition-colors"
            >
              {copiedValue === stringValue ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-gold opacity-60 hover:opacity-100" />
              )}
            </button>
          </div>
        );

      case 'hash':
        return (
          <div className="flex items-center gap-2">
            <span className="text-brand">
              {stringValue.length > 20
                ? `${stringValue.substring(0, 8)}...${stringValue.substring(stringValue.length - 8)}`
                : stringValue
              }
            </span>
            <button
              onClick={() => copyToClipboard(stringValue)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
            >
              {copiedValue === stringValue ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-gold opacity-60 hover:opacity-100" />
              )}
            </button>
          </div>
        );

      case 'amount':
        return (
          <span className="text-gold font-inter">
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
            className="text-brand hover:text-brand/80 transition-colors underline font-inter"
          >
            {stringValue}
          </Link>
        );

      case 'json':
        return (
          <pre className="text-text-primary bg-white/5 p-2 rounded text-xs overflow-x-auto scrollbar-brand font-inter">
            {stringValue}
          </pre>
        );

      default:
        return (
          <span className="text-text-primary font-inter">
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
          className="p-0 rounded-lg overflow-hidden"
        >
          <h3 className="text-xl text-text-primary font-medium p-6 border-b border-border-subtle font-inter">
            {section.title}
          </h3>

          <div className="p-6">
            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="text-secondary text-sm font-medium min-w-[150px] font-inter">
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