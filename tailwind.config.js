/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        // ... existing theme config ...
    },
    plugins: [
        require("tailwindcss-animate"),
        require("tailwind-scrollbar"),
        // ... other plugins ...
    ],
};
