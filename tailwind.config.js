/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#D4AF37',
          500: '#C5A028',
          600: '#B8860B',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  typography: {
    DEFAULT: {
      css: {
        '--tw-prose-body': '#374151',
        '--tw-prose-headings': '#111827',
        '--tw-prose-links': '#A61C30',
        '--tw-prose-bold': '#111827',
        '--tw-prose-code': '#111827',
        '--tw-prose-quotes': '#4B5563',
        '--tw-prose-quote-borders': '#A61C30',
        'h1, h2, h3, h4': {
          fontWeight: '700',
        },
        'a': {
          color: '#A61C30',
          textDecoration: 'none',
          '&:hover': {
            color: '#991B2B',
          },
        },
        'blockquote': {
          borderLeftColor: '#A61C30',
          fontStyle: 'normal',
        },
      },
    },
  },
}
