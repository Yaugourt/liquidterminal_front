import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NumberFormatType = 'US' | 'EU' | 'FR' | 'PLAIN';

export interface NumberFormat {
  type: NumberFormatType;
  example: string;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const NUMBER_FORMATS: Record<NumberFormatType, NumberFormat> = {
  US: { 
    type: 'US', 
    example: '1,234.56', 
    thousandsSeparator: ',', 
    decimalSeparator: '.' 
  },
  EU: { 
    type: 'EU', 
    example: '1.234,56', 
    thousandsSeparator: '.', 
    decimalSeparator: ',' 
  },
  FR: { 
    type: 'FR', 
    example: '1 234,56', 
    thousandsSeparator: ' ', 
    decimalSeparator: ',' 
  },
  PLAIN: { 
    type: 'PLAIN', 
    example: '1234,56', 
    thousandsSeparator: '', 
    decimalSeparator: ',' 
  }
};

interface NumberFormatState {
  format: NumberFormatType;
  setFormat: (format: NumberFormatType) => void;
}

export const useNumberFormat = create<NumberFormatState>()(
  persist(
    (set) => ({
      format: 'FR', // Format par défaut
      setFormat: (format) => set({ format }),
    }),
    {
      name: 'number-format-storage',
    }
  )
); 