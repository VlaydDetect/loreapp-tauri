/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    mode: "jit",
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#00040f",
                purple: '#3F3CBB',
                midnight: '#121063',
                metal: '#565584',
                cyan: "#00f6ff",
                lightGray: '#F1EFEE',
                dimWhite: "rgba(255, 255, 255, 0.7)",
                dimBlue: "rgba(9, 151, 124, 0.1)",
                'tahiti-blue': '#3AB7BF',
                'cool-white': '#ECEBFF',
                'bubble-gum': '#FF77E9',
                'copper-rust': '#78DCCA'
            },
            backgroundColor: {
                blackOverlay: 'rgba(0, 0 ,0 ,0.7)',
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
            fontSize: {
                'mini': ['12px', { lineHeight: '20px', letterSpacing: '0.05em' }],
                xs: ['14px', { lineHeight: '24px', letterSpacing: '-0.03em' }],
                sm: ['16px', { lineHeight: '28px', letterSpacing: '-0.03em' }],
                lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.03em' }],
                xl: ['24px', { lineHeight: '36px', letterSpacing: '-0.03em' }],
                '2xl': ['36px', { lineHeight: '48px', letterSpacing: '-0.032em' }],
                '3xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.032em' }],
                '4xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.032em' }],
                '5xl': ['80px', { lineHeight: '80px', letterSpacing: '-0.032em' }],
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
            },
            animation: {
                'slide-in': 'slide-in 0.5s ease-out',
                'slide-fwd': ' slide-fwd 0.45s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
            },
        },
        screens: {
            xs: "480px",
            ss: "620px",
            sm: "768px",
            md: "1060px",
            lg: "1200px",
            xl: "1700px",

            'xs-max': {'max': '480px'},
            'sm-max': {'max': '768px'},
            'lg-max': {'max': '1200px'},
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
        }),
    },
    plugins: [
        require('@gradin/tailwindcss-scrollbar'),
    ],
}

