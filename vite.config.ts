
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Using basic React config for maximum compatibility
      jsxImportSource: "react",
      fastRefresh: true
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      clientPort: 8080,
      timeout: 120000,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client-info, apikey, Range',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Content-Range',
      'Content-Security-Policy': "frame-ancestors 'self' https://*.lovable.ai https://*.lovable.dev http://localhost:* https://localhost:*",
      'X-Frame-Options': 'SAMEORIGIN'
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    cors: true, // Explicitly enable CORS for all routes
    middlewareMode: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@supabase/supabase-js']
  },
  // Simplified define values for better compatibility
  define: {
    __DEV__: mode === 'development' ? 'true' : 'false',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    __IN_IFRAME__: 'window !== window.parent'
  },
  // Basic esbuild config for maximum compatibility
  esbuild: {
    logLevel: 'info',
    logLimit: 0,
    jsx: 'automatic'
  }
}));
