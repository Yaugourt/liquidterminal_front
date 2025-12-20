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
				// Brand colors
				brand: {
					main: '#0B0E14',
					secondary: '#151A25',
					tertiary: '#051728',
					dark: '#0A0D12',
					accent: '#83E9FF',
					gold: '#f9e370',
					success: '#00ff88',
					error: '#ef4444',
					warning: '#f59e0b',
				},
				// Semantic text colors
				'text-primary': '#ffffff',
				'text-secondary': '#a1a1aa', // zinc-400
				'text-muted': '#71717a',     // zinc-500
				// Border tokens
				'border-subtle': 'rgba(255, 255, 255, 0.05)',
				'border-hover': 'rgba(255, 255, 255, 0.1)',
				// shadcn/ui compatibility
				primary: {
					DEFAULT: '#83E9FF',
					foreground: '#051728',
				},
				secondary: {
					DEFAULT: '#151A25',
					foreground: '#ffffff',
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff',
				},
				muted: {
					DEFAULT: '#151A25',
					foreground: '#a1a1aa',
				},
				accent: {
					DEFAULT: '#83E9FF',
					foreground: '#051728',
				},
				card: {
					DEFAULT: '#151A25',
					foreground: '#ffffff',
				},
				popover: {
					DEFAULT: '#151A25',
					foreground: '#ffffff',
				},
				input: 'rgba(255, 255, 255, 0.1)',
				ring: '#83E9FF',
			}
		}
	}
} satisfies Config;
