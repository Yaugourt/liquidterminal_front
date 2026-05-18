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
			 * V4 type scale. Absolute px values so they don't depend on root font-size.
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

				/* ===== V4 cyan signature — `bg-brand`, `text-brand`, `bg-brand-hover`, `bg-brand-deep` ===== */
				brand: {
					DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
					hover: 'rgb(var(--brand-hover) / <alpha-value>)',
					deep: 'rgb(var(--brand-deep) / <alpha-value>)',
					'text-on': 'rgb(var(--brand-text-on) / <alpha-value>)',
					/* ----- legacy aliases (pages pas encore reprises — retirées au fil de la migration) ----- */
					main: '#0B0E14',
					secondary: '#151A25',
					tertiary: '#051728',
					dark: '#0A0D12',
					accent: '#83E9FF',
					gold: '#f9e370',
					success: '#00ff88',
					error: '#ef4444',
					warning: '#f59e0b',
					/* External brand color (third-party service). */
					telegram: '#0088cc',
				},

				/* ===== V4 surfaces (whisper navy) — `bg-base`, `bg-surface`, `bg-surface-2`, `bg-surface-3` ===== */
				base: 'rgb(var(--bg-base) / <alpha-value>)',
				surface: 'rgb(var(--bg-surface) / <alpha-value>)',
				'surface-2': 'rgb(var(--bg-surface-2) / <alpha-value>)',
				'surface-3': 'rgb(var(--bg-surface-3) / <alpha-value>)',

				/* ===== V4 action color (primary CTAs) ===== */
				action: {
					DEFAULT: 'rgb(var(--action) / <alpha-value>)',
					hover: 'rgb(var(--action-hover) / <alpha-value>)',
				},

				/* ===== V4 gold (`text-gold`, `bg-gold`) — reserved for Builder Fees column ===== */
				gold: 'rgb(var(--gold) / <alpha-value>)',

				/* ===== V4 semantic ===== */
				success: 'rgb(var(--success) / <alpha-value>)',
				danger: 'rgb(var(--danger) / <alpha-value>)',
				warning: 'rgb(var(--warning) / <alpha-value>)',

				/* ===== V4 semantic text colors ===== */
				'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',     // #E8EAED
				'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)', // #9CA3AF
				'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',   // #6B7280
				'text-muted': '#71717a',     // legacy alias (zinc-500)

				/* ===== V4 borders (whisper navy — opaque) ===== */
				'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
				'border-default': 'rgb(var(--border-default) / <alpha-value>)',
				'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
				'border-hover': 'rgba(255, 255, 255, 0.1)', // legacy alias

				/* ===== shadcn/ui compatibility — mapped to V4 tokens by role ===== */
				primary: {
					DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
					foreground: '#051728',
				},
				secondary: {
					DEFAULT: 'rgb(var(--bg-surface) / <alpha-value>)',
					foreground: 'rgb(var(--text-primary) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
					foreground: '#ffffff',
				},
				muted: {
					DEFAULT: 'rgb(var(--bg-surface-2) / <alpha-value>)',
					foreground: 'rgb(var(--text-secondary) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
					foreground: '#051728',
				},
				card: {
					DEFAULT: 'rgb(var(--bg-surface) / <alpha-value>)',
					foreground: 'rgb(var(--text-primary) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'rgb(var(--bg-surface) / <alpha-value>)',
					foreground: 'rgb(var(--text-primary) / <alpha-value>)',
				},
				input: 'rgb(var(--border-default) / <alpha-value>)',
				ring: 'rgb(var(--brand) / <alpha-value>)',
			},
			/**
			 * V4 radius: cards/panels use `rounded-lg` (8px). Legacy consumers use
			 * `rounded-2xl` (default 16px) — override `2xl` to 8px so they snap to V4.
			 * `xl` (12px) left untouched: modal radius.
			 */
			borderRadius: {
				'2xl': '8px',
			},
		}
	}
} satisfies Config;
