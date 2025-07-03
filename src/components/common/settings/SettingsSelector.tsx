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
          className="hover:bg-[#83E9FF1A] text-[#f9e370]"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] bg-[#051728] border-[#83E9FF4D]">
        {/* Section Format des nombres */}
        <div className="px-2 py-1.5">
          <h3 className="text-xs font-medium text-[#83E9FF] uppercase tracking-wide">Numbers</h3>
        </div>
        {Object.entries(NUMBER_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-[#83E9FF1A] ${
              numberFormat === key ? 'text-[#83E9FF]' : 'text-white'
            }`}
            onClick={() => setNumberFormat(key as NumberFormatType)}
          >
            <span>{value.example}</span>
            {numberFormat === key && (
              <span className="h-2 w-2 rounded-full bg-[#83E9FF]" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="bg-[#FFFFFF1A]" />
        
        {/* Section Format des dates */}
        <div className="px-2 py-1.5">
          <h3 className="text-xs font-medium text-[#83E9FF] uppercase tracking-wide">Dates</h3>
        </div>
        {Object.entries(DATE_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-[#83E9FF1A] ${
              dateFormat === key ? 'text-[#83E9FF]' : 'text-white'
            }`}
            onClick={() => setDateFormat(key as DateFormatType)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{value.example}</span>
              <span className="text-xs text-[#FFFFFF80]">{value.description}</span>
            </div>
            {dateFormat === key && (
              <span className="h-2 w-2 rounded-full bg-[#83E9FF]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 