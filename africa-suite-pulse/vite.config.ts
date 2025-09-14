import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
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
          // Core React dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks - optimized
          'radix-core': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-select', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover'
          ],
          'radix-extended': [
            '@radix-ui/react-tooltip', 
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs'
          ],
          'ui-components': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          
          // Data and state management
          'data-layer': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // Charts and visualization - isolated for lazy loading
          'charts': ['recharts'],
          
          // Feature-specific chunks
          'pos-features': ['html2canvas', 'jspdf', 'qrcode', 'qrcode.react'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['date-fns', 'use-debounce'],
          
          // Theme and styling
          'theme': ['next-themes', 'sonner']
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
    chunkSizeWarningLimit: 800,
  },
}));
