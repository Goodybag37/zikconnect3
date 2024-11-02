// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Add this line to include all files in your src folder
    "./public/index.html", // Optional, include this if you have custom styles in HTML
  ],
  theme: {
    extend: {
      colors: {
        primary: "#yourColorValueHere", // Define your primary color here
      },
    },
  },
  plugins: [],
};
