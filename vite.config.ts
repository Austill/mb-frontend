import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// FIX: Add global error handlers for file read errors (OneDrive conflicts)
if (process.env.NODE_ENV !== 'production') {
  process.on('uncaughtException', (error) => {
    if (error.message?.includes('UNKNOWN') || error.message?.includes('read')) {
      console.warn('⚠️ File read error detected (likely OneDrive conflict):', error.message);
      console.warn('⚠️ Recommend moving repository outside OneDrive for stability');
      // Don't crash - just log the warning
      return;
    }
    // Re-throw other errors
    throw error;
  });

  process.on('unhandledRejection', (reason) => {
    console.warn('⚠️ Unhandled promise rejection:', reason);
  });
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // FIX: use VITE_API_URL and vite proxy to forward /api to backend:5000
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    watch: {
      // FIX: avoid chokidar watching OneDrive temp metadata files
      ignored: ['**/.git/**', '**/node_modules/**', '**/OneDrive/**', '**~*']
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
