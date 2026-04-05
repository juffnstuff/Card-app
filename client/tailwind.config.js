/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDF6EE',
        'cream-dark': '#F5E6D3',
        warmth: '#D4956A',
        'warmth-dark': '#B8764E',
        sage: '#8BA888',
        'sage-dark': '#6B8B68',
        charcoal: '#2D2926',
        'charcoal-light': '#4A4543',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
