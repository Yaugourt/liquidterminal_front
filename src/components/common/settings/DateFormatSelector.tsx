import { Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDateFormat, DATE_FORMATS, DateFormatType } from '@/store/date-format.store';

export function DateFormatSelector() {
  const { format, setFormat } = useDateFormat();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-[#83E9FF1A] text-brand-gold"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px] bg-brand-tertiary border-[#83E9FF4D]">
        {Object.entries(DATE_FORMATS).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            className={`flex justify-between items-center px-3 py-2 text-sm cursor-pointer hover:bg-[#83E9FF1A] ${
              format === key ? 'text-brand-accent' : 'text-white'
            }`}
            onClick={() => setFormat(key as DateFormatType)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{value.example}</span>
              <span className="text-xs text-[#FFFFFF80]">{value.description}</span>
            </div>
            {format === key && (
              <span className="h-2 w-2 rounded-full bg-brand-accent" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 