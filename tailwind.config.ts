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
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
