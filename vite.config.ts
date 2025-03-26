
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Improve React refresh and error handling
      fastRefresh: true,
      jsxImportSource: "react"
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
      overlay: true, // Show errors as overlay
      clientPort: 8080, // Ensure correct port for HMR
      timeout: 120000, // Increase timeout
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client-info, apikey, Range',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Content-Range',
      'Content-Type': 'application/javascript'
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    middlewareMode: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@supabase/supabase-js']
  },
  // Add debugging options
  define: {
    __DEV__: mode === 'development',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
  },
  // Add some diagnostic flags to help troubleshoot rendering issues
  esbuild: {
    logLevel: 'info',
    logLimit: 0,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
}));
