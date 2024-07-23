import type {Config} from 'tailwindcss';

import tailwindcssAnimatePlugin from 'tailwindcss-animate';
import tailwindScrollbarHidePlugin from 'tailwind-scrollbar-hide';
import tailwindcssScrollbarPlugin from '@gradin/tailwindcss-scrollbar';

export default {
    darkMode: ['class'],
    mode: "jit",
    content: [
        './index.html',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "tw-",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                purple: '#3F3CBB',
                midnight: '#121063',
                metal: '#565584',
                cyan: "#00f6ff",
                lightGray: '#F1EFEE',
                dimWhite: "rgba(255, 255, 255, 0.7)",
                dimBlue: "rgba(9, 151, 124, 0.1)",
                'tahiti-blue': '#3AB7BF',
                'cool-blue': '#2997FF',
                'cool-gray': {
                    DEFAULT: '#86868B',
                    100: '#94928D',
                    200: '#AFAFAF',
                    300: '#42424570',
                },
                'zinc': '#101010',
                'cool-white': '#ECEBFF',
                'bubble-gum': '#FF77E9',
                'copper-rust': '#78DCCA',
                'rough-grey': '#1e1e1e',
                'light-gray': '#363636',
                'white-gray': '#b3b3b3',
                'brown-grey': '#262626',
            },
            backgroundColor: {
                blackOverlay: 'rgb(0 0 0 / 0.7)',
            },
            backgroundImage: {
                'radial-gradient': 'radial-gradient(circle at 10% 20%, rgb(4 159 108 / 1) 0%, rgb(194 254 113 / 1) 90.1%)',
            },
            boxShadow: {
                sm: '0px 2px 4px 0px rgba(11, 10, 55, 0.15)',
                lg: '0px 8px 20px 0px rgba(18, 16, 99, 0.06)'
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                satoshi: ["Satoshi", "sans-serif"],
                inter: ["Inter", "sans-serif"],
                'family-inherit': 'inherit',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            borderWidth: {
                px: '1px',
            },
            fontSize: {
                'tooltip': ['12px', {lineHeight: '3px', letterSpacing: '-0.01rem', fontWeight: 'bold'}],
                'mini': ['12px', {lineHeight: '20px', letterSpacing: '0.05em'}],
                xs: ['14px', {lineHeight: '24px', letterSpacing: '-0.03em'}],
                sm: ['16px', {lineHeight: '28px', letterSpacing: '-0.03em'}],
                lg: ['18px', {lineHeight: '28px', letterSpacing: '-0.03em'}],
                xl: ['24px', {lineHeight: '36px', letterSpacing: '-0.03em'}],
                '2xl': ['36px', {lineHeight: '48px', letterSpacing: '-0.032em'}],
                '3xl': ['48px', {lineHeight: '56px', letterSpacing: '-0.032em'}],
                '4xl': ['56px', {lineHeight: '64px', letterSpacing: '-0.032em'}],
                '5xl': ['80px', {lineHeight: '80px', letterSpacing: '-0.032em'}],
                'size-inherit': 'inherit'
            },
            gridTemplateColumns: {
                'auto-fit': `repeat(auto-fit, minmax(250px, 1fr))`
            },
            cursor: {
                'zoom-in': 'zoom-in',
            },
            transitionProperty: {
                height: 'height',
            },
            spacing: {
                'px': '1px',
            },
            keyframes: {
                'slide-in': {
                    '0%': {
                        '-webkit-transform': 'translateX(-200px)',
                        transform: 'translateX(-200px)',
                    },
                    '100%': {
                        '-webkit-transform': 'translateX(0px)',
                        transform: 'translateX(0px)',
                    },
                },

                'slide-fwd': {
                    '0%': {
                        '-webkit-transform': 'translateZ(0px)',
                        transform: 'translateZ(0px)',
                    },
                    '100%': {
                        '-webkit-transform': 'translateZ(160px)',
                        transform: 'translateZ(160px)',
                    },
                },
                "accordion-down": {
                    from: {height: "0"},
                    to: {height: "var(--radix-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--radix-accordion-content-height)"},
                    to: {height: "0"},
                },
            },
            animation: {
                'slide-in': 'slide-in 0.5s ease-out',
                'slide-fwd': ' slide-fwd 0.45s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',

            'xs-max': {'max': '480px'},
            'sm-max': {'max': '768px'},
            'lg-max': {'max': '1025px'},
        },
        scrollbar: (theme) => ({
            DEFAULT: {
                size: theme('spacing.2'),
                track: {
                    background: theme('colors.purple.200'),
                    darkBackground: theme('colors.gray.800'),
                    borderRadius: '40px',
                },
                thumb: {
                    background: theme('colors.purple.300'),
                    darkBackground: theme('colors.gray.700'),
                    borderRadius: '40px',
                },
                hover: {
                    background: theme('colors.purple.400'),
                    darkBackground: theme('colors.gray.600'),
                },
            },
            thin: {
                size: '3px',
                track: {
                    background: theme('colors.gray.200'),
                    darkBackground: theme('colors.green.800'),
                },
                thumb: {
                    background: theme('colors.gray.300'),
                    darkBackground: theme('colors.green.700'),
                },
                hover: {
                    background: theme('colors.gray.400'),
                    darkBackground: theme('colors.green.600'),
                },
            },
            hide: {
                size: '0',
                display: 'none !important',
                track: {},
                thumb: {},
                hover: {},
            }
        }),
    },
    plugins: [
        tailwindcssScrollbarPlugin,
        tailwindScrollbarHidePlugin,
        tailwindcssAnimatePlugin,
    ],
} satisfies Config;
