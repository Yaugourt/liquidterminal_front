/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        // ... existing theme config ...
        fontFamily: {
            sans: ["var(--font-inter)"],
            mono: ["var(--font-geist-mono)"],
            serif: ["Higuen Elegant Serif", "serif"],
        },
        extend: {
            // ... other extensions ...
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        require("tailwind-scrollbar"),
        // ... other plugins ...
    ],
};
