import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          50: '#f7f2ed',
          100: '#ece0d5',
          200: '#dec2b0',
          300: '#cc9d82',
          400: '#bd7b5a',
          500: '#a65f3e',
          600: '#8f4f34',
          700: '#74402d',
          800: '#603629',
          900: '#4f2e25',
        },
        crema: {
          50: '#fdfbf7',
          100: '#f7f0e6',
          200: '#fbf6ee',
          300: '#ede0cc',
          400: '#dfc7a8',
        },
        dorado: {
          100: '#f5ecd6',
          200: '#ead7ad',
          300: '#debf83',
          400: '#c9a66b',
          500: '#b08a4b',
          600: '#8f6f3d',
        },
        // Conservamos la paleta legacy 'drip' por si queda alguna referencia antigua
        drip: {
          50: '#fdf8f3',
          100: '#f9ecdb',
          200: '#f1d5b1',
          300: '#e6b87d',
          400: '#da9852',
          500: '#cf8138',
          600: '#b9662c',
          700: '#974d27',
          800: '#7b3f26',
          900: '#653522',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
