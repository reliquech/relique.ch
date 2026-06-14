import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/ui/**/*.{ts,tsx}",
    "./src/admin/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 
    'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8',
    'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12',
    'md:col-span-1', 'md:col-span-2', 'md:col-span-3', 'md:col-span-4',
    'md:col-span-5', 'md:col-span-6', 'md:col-span-7', 'md:col-span-8',
    'md:col-span-9', 'md:col-span-10', 'md:col-span-11', 'md:col-span-12',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			'work-sans': ['var(--font-work-sans)', 'sans-serif'],
  			'zapf-renaissance': ['var(--font-zapf-renaissance)', 'serif'],
  			sans: ['var(--font-work-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			},
			// Custom colors from example design
			navy: '#0F2854',
			primaryBlue: '#1C4D8D',
			accentBlue: '#498BC4',
			highlightIce: '#BDE8F5',
			bgDark: '#0A0A0A',
			cardDark: '#121212',
			textSec: '#B3B3B3',
			borderDark: '#333333',
			// Admin theme tokens (unified app — admin routes)
			surface: '#121212',
			'bg-0': '#0A0A0A',
			success: '#10B981',
			warning: '#F59E0B',
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

