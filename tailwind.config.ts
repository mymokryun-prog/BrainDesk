import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211d',
        graphite: '#2f3a36',
        mist: '#f4f7f5',
        fern: '#2f6f58',
        brass: '#b08d57',
        coral: '#c9695d',
        skyglass: '#dcebf1',
      },
      boxShadow: {
        panel: '0 18px 70px rgba(24, 32, 29, 0.12)',
        node: '0 10px 28px rgba(23, 33, 29, 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
