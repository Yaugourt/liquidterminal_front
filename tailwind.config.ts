import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";

export default {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  plugins: [scrollbar],
    theme: {
    	extend: {
    		fontFamily: {
    			'higuen': ['Higuen_Elegant_Serif', 'serif'],
    			'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
    			'sans': ['var(--font-inter)', 'Inter', 'sans-serif'],
    		},
    		screens: {
    			'custom': '1227px',
    		},
    		colors: {
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    		}
    	}
    }
} satisfies Config;
