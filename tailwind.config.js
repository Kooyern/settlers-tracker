/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Settlers-inspirerte farger
        'settlers-gold': '#D4A84B',
        'settlers-brown': '#8B4513',
        'settlers-dark-brown': '#5D3A1A',
        'settlers-green': '#228B22',
        'settlers-dark-green': '#0F4F0F',
        'settlers-blue': '#1E90FF',
        'settlers-red': '#DC143C',
        'settlers-stone': '#708090',
        'settlers-wood': '#A0522D',
        'settlers-wheat': '#F5DEB3',
        'settlers-parchment': '#F5E6C8',
        'settlers-dark': '#2D1F14',
      },
      fontFamily: {
        'medieval': ['Georgia', 'serif'],
      },
      backgroundImage: {
        'wood-pattern': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%238B4513\" width=\"100\" height=\"100\"/%3E%3Cpath d=\"M0 0h100v2H0zM0 10h100v1H0zM0 20h100v2H0zM0 35h100v1H0zM0 48h100v2H0zM0 62h100v1H0zM0 75h100v2H0zM0 88h100v1H0z\" fill=\"%23A0522D\" opacity=\"0.3\"/%3E%3C/svg%3E')",
      },
      boxShadow: {
        'settlers': '0 4px 6px -1px rgba(93, 58, 26, 0.5), 0 2px 4px -1px rgba(93, 58, 26, 0.3)',
        'settlers-lg': '0 10px 15px -3px rgba(93, 58, 26, 0.5), 0 4px 6px -2px rgba(93, 58, 26, 0.3)',
      }
    },
  },
  plugins: [],
}
