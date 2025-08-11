import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'display': ['Space Grotesk', 'Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// Système unifié depuis tokens.css
				primary: {
					DEFAULT: 'hsl(var(--brand-primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--brand-primary-hover))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--brand-accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--brand-accent-hover))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				
				// Statuts métier unifiés - Enhanced vibrancy
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))', 
				info: 'hsl(var(--info))',
				danger: 'hsl(var(--danger))',
				
				// Status sémantiques complets
				'status-confirmed': 'hsl(var(--status-confirmed))',
				'status-present': 'hsl(var(--status-present))', 
				'status-option': 'hsl(var(--status-option))',
				'status-cancelled': 'hsl(var(--status-cancelled))',
				'status-maintenance': 'hsl(var(--status-maintenance))',
				
				// Surfaces pastel
				'soft-primary': 'hsl(var(--soft-primary))',
				'soft-accent': 'hsl(var(--soft-accent))',
				'soft-success': 'hsl(var(--soft-success))',
				'soft-info': 'hsl(var(--soft-info))',
				'soft-warning': 'hsl(var(--soft-warning))',
				'soft-danger': 'hsl(var(--soft-danger))',
				
				// Luxury brand colors
				'brand-accent': 'hsl(var(--brand-accent))',
				'brand-copper': 'hsl(var(--brand-copper))',
				'pearl': 'hsl(var(--pearl))',
				'charcoal': 'hsl(var(--charcoal))',
				'platinum': 'hsl(var(--platinum))',
				
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				// Accordéon
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Animations fluides
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
