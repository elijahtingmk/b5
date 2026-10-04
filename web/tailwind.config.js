import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Iowan Old Style', 'Georgia', 'serif']
      },
      // drelijah.org palette
      colors: {
        brand: {
          navy: '#0c1424',
          'navy-2': '#141e30',
          'navy-3': '#1c2a40',
          gold: '#c4964a',
          'gold-soft': '#d4ae6e',
          copper: '#9a7344',
          paper: '#f6f2ea',
          cream: '#fbf8f3',
          ink: '#1a1714'
        }
      },
      keyframes: {
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        heartbeat: 'heartbeat 1s ease-in-out infinite',
        'infinite-scroll': 'infinite-scroll 25s linear infinite'
      }
    }
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: '#fbf8f3',
            foreground: '#1a1714',
            primary: {
              50: '#ececed',
              100: '#d3d5d8',
              200: '#a8aab0',
              300: '#7c8089',
              400: '#464c59',
              500: '#0c1424',
              600: '#0a101e',
              700: '#080d17',
              800: '#060911',
              900: '#03060a',
              DEFAULT: '#0c1424',
              foreground: '#f6f2ea'
            },
            secondary: {
              50: '#f7f4f0',
              100: '#ede6dd',
              200: '#dbcdbc',
              300: '#c8b39a',
              400: '#b29571',
              500: '#9a7344',
              600: '#7e5e38',
              700: '#634a2c',
              800: '#47351f',
              900: '#2b2013',
              DEFAULT: '#9a7344',
              foreground: '#fffdf8'
            },
            focus: '#c4964a'
          }
        },
        dark: {
          colors: {
            background: '#0c1424',
            foreground: '#f6f2ea',
            content1: '#141e30',
            content2: '#1c2a40',
            primary: {
              50: '#372a15',
              100: '#5a4522',
              200: '#7d602f',
              300: '#a17b3d',
              400: '#c4964a',
              500: '#d2af75',
              600: '#dfc69d',
              700: '#ead9be',
              800: '#f4ecde',
              900: '#faf7f1',
              DEFAULT: '#c4964a',
              foreground: '#0c1424'
            },
            secondary: {
              50: '#3b311f',
              100: '#625033',
              200: '#886f46',
              300: '#ae8f5a',
              400: '#d4ae6e',
              500: '#dec191',
              600: '#e8d3b1',
              700: '#f0e2cb',
              800: '#f7f0e5',
              900: '#fcf9f3',
              DEFAULT: '#d4ae6e',
              foreground: '#0c1424'
            },
            focus: '#c4964a'
          }
        }
      }
    })
  ]
};
