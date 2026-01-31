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
        void: '#050508',
        obsidian: '#0a0a0f',
        charcoal: '#1a1a24',
        silver: '#c0c0c0',
        platinum: '#e5e5e5',
        life: '#00ff9f',
        death: '#ff2d55',
        spectral: '#8b5cf6',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'silver-gradient': 'linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 50%, #c0c0c0 100%)',
        'void-gradient': 'linear-gradient(135deg, #050508 0%, #0a0a0f 50%, #1a1a24 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow-life': '0 0 30px rgba(0, 255, 159, 0.3)',
        'glow-spectral': '0 0 40px rgba(139, 92, 246, 0.25)',
        'glow-white': '0 0 40px rgba(255, 255, 255, 0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
