/** @type {import('tailwindcss').Config} */
export default {
   darkMode: ['class', '[class~="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo 600
        secondary: '#0f172a', // Slate 900
      },
    },
  },
  plugins: [],
}
