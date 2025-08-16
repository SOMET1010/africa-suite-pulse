import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks
          'radix-core': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu'],
          'radix-extended': ['@radix-ui/react-popover', '@radix-ui/react-tooltip', '@radix-ui/react-accordion'],
          'ui-components': ['lucide-react', 'class-variance-authority', 'clsx'],
          
          // Data and state management
          'data-layer': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // Feature-specific chunks
          'pos-features': ['recharts', 'html2canvas', 'jspdf'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['date-fns', 'use-debounce']
        },
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      legalComments: 'none',
      minifyIdentifiers: mode === 'production',
      minifySyntax: mode === 'production',
      minifyWhitespace: mode === 'production',
    },
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'production' ? false : 'inline',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
}));
