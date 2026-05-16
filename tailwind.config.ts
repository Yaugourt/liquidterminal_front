import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
	],

	plugins: [],
	theme: {
		extend: {
			fontFamily: {
				/** Inter for UI / body / headings. */
				inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
				sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
				/** JetBrains Mono for all numeric data (V4 signature). Tabular-nums via `.mono` utility. */
				mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', 'Menlo', 'monospace'],
			},
			/**
			 * V4 type scale (docs/DESIGN_SYSTEM_V4.md §3.4). Absolute px values so
			 * they don't depend on root font-size. Replaces Tailwind defaults
			 * (which rendered text-sm=14px, text-xs=12px… — the V4 spec wants 13/11).
			 */
			fontSize: {
				'2xs': ['10px', { lineHeight: '1.4' }],
				'xs': ['11px', { lineHeight: '1.4' }],
				'sm': ['13px', { lineHeight: '1.5' }],
				'base': ['14px', { lineHeight: '1.5' }],
				'lg': ['16px', { lineHeight: '1.4' }],
				'xl': ['18px', { lineHeight: '1.3' }],
				'2xl': ['22px', { lineHeight: '1.2' }],
				'3xl': ['28px', { lineHeight: '1.1' }],
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
					// V2 legacy (still used by other pages, kept for backwards-compat)
					main: '#0B0E14',
					secondary: '#151A25',
					tertiary: '#051728',
					dark: '#0A0D12',
					accent: '#83E9FF',
					gold: '#f9e370',
					success: '#00ff88',
					error: '#ef4444',
					warning: '#f59e0b',
					// External brand colors (third-party services).
					// Document new additions in docs/DESIGN_SYSTEM.md.
					telegram: '#0088cc',
					// V4 cyan signature — `bg-brand`, `text-brand`, `bg-brand-hover`, `bg-brand-deep`, `text-brand-text-on`
					DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
					hover: 'rgb(var(--brand-hover) / <alpha-value>)',
					deep: 'rgb(var(--brand-deep) / <alpha-value>)',
					'text-on': 'rgb(var(--brand-text-on) / <alpha-value>)',
				},
				// V4 surfaces (whisper navy signature) — `bg-base`, `bg-surface`, `bg-surface-2`, `bg-surface-3`
				base: 'rgb(var(--bg-base) / <alpha-value>)',
				surface: 'rgb(var(--bg-surface) / <alpha-value>)',
				'surface-2': 'rgb(var(--bg-surface-2) / <alpha-value>)',
				'surface-3': 'rgb(var(--bg-surface-3) / <alpha-value>)',
				// V4 action color (primary CTAs)
				action: {
					DEFAULT: 'rgb(var(--action) / <alpha-value>)',
					hover: 'rgb(var(--action-hover) / <alpha-value>)',
				},
				// V4 gold (top-level for `text-gold`, `bg-gold`). Reserved for Builder Fees column.
				gold: 'rgb(var(--gold) / <alpha-value>)',
				// V4 semantic
				success: 'rgb(var(--success) / <alpha-value>)',
				danger: 'rgb(var(--danger) / <alpha-value>)',
				warning: 'rgb(var(--warning) / <alpha-value>)',
				// V4 semantic text colors (CSS vars — light mode swap later)
				'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',     // #E8EAED
				'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)', // #9CA3AF
				'text-muted': '#71717a',     // zinc-500 — V2 legacy, unmigrated pages
				// V4 new text tier
				'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
				// V4 border (whisper navy #1E2535 — opaque, replaces V2 white/5)
				'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
				'border-hover': 'rgba(255, 255, 255, 0.1)',
				// V4 borders (whisper navy palette) — `border-border-default`, `border-border-strong`
				'border-default': 'rgb(var(--border-default) / <alpha-value>)',
				'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
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
