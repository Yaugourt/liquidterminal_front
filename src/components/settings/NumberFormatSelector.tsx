import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNumberFormat, NUMBER_FORMATS, NumberFormatType } from '@/store/number-format.store';

export function NumberFormatSelector() {
  const { format, setFormat } = useNumberFormat();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-[#83E9FF1A] text-[#83E9FF]"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] bg-[#051728] border-[#83E9FF4D]">
        {Object.entries(NUMBER_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center px-3 py-2 text-sm cursor-pointer hover:bg-[#83E9FF1A] ${
              format === key ? 'text-[#83E9FF]' : 'text-white'
            }`}
            onClick={() => setFormat(key as NumberFormatType)}
          >
            <span>{value.example}</span>
            {format === key && (
              <span className="h-2 w-2 rounded-full bg-[#83E9FF]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 