import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNumberFormat, NUMBER_FORMATS, NumberFormatType } from '@/store/number-format.store';
import { useDateFormat, DATE_FORMATS, DateFormatType } from '@/store/date-format.store';

export function SettingsSelector() {
  const { format: numberFormat, setFormat: setNumberFormat } = useNumberFormat();
  const { format: dateFormat, setFormat: setDateFormat } = useDateFormat();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md border border-border-subtle bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] bg-surface border-border-default">
        <div className="px-2 py-1.5">
          <h3 className="text-[10px] uppercase tracking-wider font-medium text-text-tertiary">Numbers</h3>
        </div>
        {Object.entries(NUMBER_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center mono ${numberFormat === key ? 'text-brand' : 'text-text-primary'}`}
            onClick={() => setNumberFormat(key as NumberFormatType)}
          >
            <span>{value.example}</span>
            {numberFormat === key && (
              <span className="h-2 w-2 rounded-full bg-brand" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <h3 className="text-[10px] uppercase tracking-wider font-medium text-text-tertiary">Dates</h3>
        </div>
        {Object.entries(DATE_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center ${dateFormat === key ? 'text-brand' : 'text-text-primary'}`}
            onClick={() => setDateFormat(key as DateFormatType)}
          >
            <div className="flex flex-col">
              <span className="mono font-medium">{value.example}</span>
              <span className="text-xs text-text-tertiary">{value.description}</span>
            </div>
            {dateFormat === key && (
              <span className="h-2 w-2 rounded-full bg-brand" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 