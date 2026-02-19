/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-amber': '#FFBF00',
                'neon-orange': '#FF8C00',
                'dark-bg': '#0a0a0a',
                'dark-card': '#111111',
                'dark-border': '#1f1f1f',
                'neon-green': '#00ff41',
                'neon-red': '#ff0040',
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
                cairo: ['"Cairo"', 'sans-serif'],
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
                'typing': 'typing 3.5s steps(40, end)',
                'blink': 'blink 1s step-end infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'matrix-fall': 'matrixFall 20s linear infinite',
            },
            keyframes: {
                pulseNeon: {
                    '0%, 100%': { boxShadow: '0 0 5px #FFBF00, 0 0 10px #FFBF00, 0 0 20px #FFBF00' },
                    '50%': { boxShadow: '0 0 10px #FF8C00, 0 0 20px #FF8C00, 0 0 40px #FF8C00' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                glow: {
                    from: { textShadow: '0 0 10px #FFBF00, 0 0 20px #FFBF00' },
                    to: { textShadow: '0 0 20px #FF8C00, 0 0 40px #FF8C00, 0 0 60px #FF8C00' },
                },
                matrixFall: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
            },
            dropShadow: {
                'neon': '0 0 8px rgba(255, 191, 0, 0.8)',
                'neon-orange': '0 0 8px rgba(255, 140, 0, 0.8)',
            },
        },
    },
    plugins: [],
}
