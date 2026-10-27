/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          dark: '#1e1f22',
          darker: '#111214',
          card: '#2b2d31',
          hover: '#35373c',
          sidebar: '#232428',
          textMuted: '#949ba4',
          textNormal: '#dbdee1',
          textHeader: '#f2f3f5',
        }
      }
    },
  },
  plugins: [],
}
