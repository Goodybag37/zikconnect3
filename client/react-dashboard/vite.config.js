import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "/home/ubuntu/apps/zikconnect-app/client/react-dashboard/build/", // Direct output to your Nginx root
    emptyOutDir: true, // Clears old files on build
  },
});
