import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
    },
    // Define environment variables explicitly for build
    // This ensures they're available even when process.env might be empty
    // IMPORTANT: In Vercel, make sure to set VITE_MAPBOX_TOKEN in Environment Variables
    // and REDEPLOY after adding the variable (new variables only take effect on new deployments)
    define: {
      // Try multiple sources: loaded env, process.env, then fallback to empty string
      'import.meta.env.VITE_MAPBOX_TOKEN': JSON.stringify(
        env.VITE_MAPBOX_TOKEN || 
        env.VITE_MAPBOX_PUBLIC_TOKEN || 
        process.env.VITE_MAPBOX_TOKEN || 
        process.env.VITE_MAPBOX_PUBLIC_TOKEN || 
        ''
      ),
      'import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN': JSON.stringify(
        env.VITE_MAPBOX_PUBLIC_TOKEN || 
        env.VITE_MAPBOX_TOKEN || 
        process.env.VITE_MAPBOX_PUBLIC_TOKEN || 
        process.env.VITE_MAPBOX_TOKEN || 
        ''
      ),
    },
    optimizeDeps: {
      // Pre-build dependencies for faster startup
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'mapbox-gl',
        'react-map-gl',
        'recharts',
        'lucide-react',
        'date-fns',
        'clsx',
        'tailwind-merge',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        'supercluster',
        'react-countup',
      ],
      force: false,
    },
    build: {
      // Production build optimization
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'map-vendor': ['mapbox-gl', 'react-map-gl', 'supercluster'],
            'ui-vendor': ['recharts', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
