import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DateFormatType = 'DD_MM_YYYY' | 'MM_DD_YYYY' | 'YYYY_MM_DD' | 'DD_MMM_YYYY' | 'MMM_DD_YYYY' | 'DD_MMMM_YYYY' | 'RELATIVE';

export interface DateFormat {
  type: DateFormatType;
  example: string;
  format: string;
  description: string;
}

export const DATE_FORMATS: Record<DateFormatType, DateFormat> = {
  DD_MM_YYYY: { 
    type: 'DD_MM_YYYY', 
    example: '23/01/2025', 
    format: 'DD/MM/YYYY',
    description: 'European'
  },
  MM_DD_YYYY: { 
    type: 'MM_DD_YYYY', 
    example: '01/23/2025', 
    format: 'MM/DD/YYYY',
    description: 'US'
  },
  YYYY_MM_DD: { 
    type: 'YYYY_MM_DD', 
    example: '2025-01-23', 
    format: 'YYYY-MM-DD',
    description: 'ISO'
  },
  DD_MMM_YYYY: { 
    type: 'DD_MMM_YYYY', 
    example: '23 Jan 2025', 
    format: 'DD MMM YYYY',
    description: 'Short'
  },
  MMM_DD_YYYY: { 
    type: 'MMM_DD_YYYY', 
    example: 'Jan 23, 2025', 
    format: 'MMM DD, YYYY',
    description: 'US Short'
  },
  DD_MMMM_YYYY: { 
    type: 'DD_MMMM_YYYY', 
    example: '23 January 2025', 
    format: 'DD MMMM YYYY',
    description: 'Full'
  },
  RELATIVE: { 
    type: 'RELATIVE', 
    example: '2 days ago', 
    format: 'relative',
    description: 'Relative'
  }
};

interface DateFormatState {
  format: DateFormatType;
  setFormat: (format: DateFormatType) => void;
}

export const useDateFormat = create<DateFormatState>()(
  persist(
    (set) => ({
      format: 'DD_MM_YYYY', // Format par défaut européen
      setFormat: (format) => set({ format }),
    }),
    {
      name: 'date-format-storage',
    }
  )
); 