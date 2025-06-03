/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        // ... existing theme config ...
        fontFamily: {
            sans: ["var(--font-inter)"],
            mono: ["var(--font-geist-mono)"],
            serif: ["var(--font-inter)"],
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
