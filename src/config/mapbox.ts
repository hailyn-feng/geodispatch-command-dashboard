/**
 * Mapbox Configuration
 * Centralized configuration for Mapbox GL with fallback handling and runtime safety
 */

// Get Mapbox token from environment variables with multiple fallback strategies
// Priority: VITE_MAPBOX_TOKEN > VITE_MAPBOX_PUBLIC_TOKEN > window runtime injection
const getMapboxToken = (): string => {
  // Try import.meta.env first (Vite's standard way)
  const viteToken = import.meta.env.VITE_MAPBOX_TOKEN || 
                    import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN

  if (viteToken && viteToken !== '' && viteToken !== 'undefined') {
    return viteToken
  }

  // Fallback: Try window object (runtime injection)
  // This allows manual token injection for emergency fixes
  if (typeof window !== 'undefined' && (window as any).__MAPBOX_TOKEN__) {
    console.warn('⚠️ Using runtime-injected Mapbox token from window.__MAPBOX_TOKEN__')
    return (window as any).__MAPBOX_TOKEN__
  }

  // No token found
  return ''
}

export const MAPBOX_TOKEN = getMapboxToken()

// Default map center (New York City) - fallback coordinates
export const DEFAULT_MAP_CENTER = {
  latitude: 40.7128,
  longitude: -74.0060,
  zoom: 12,
}

// Validate token and throw user-friendly error if missing
export function validateMapboxToken(): void {
  const token = getMapboxToken()
  
  if (!token || token === '' || token === 'undefined') {
    const errorMsg = `
╔════════════════════════════════════════════════════════════════╗
║                  MAPBOX TOKEN MISSING ERROR                    ║
╚════════════════════════════════════════════════════════════════╝

❌ Mapbox access token is required but not found.

Current environment check results:
  - import.meta.env.VITE_MAPBOX_TOKEN: ${import.meta.env.VITE_MAPBOX_TOKEN || 'undefined'}
  - import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN: ${import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || 'undefined'}
  - window.__MAPBOX_TOKEN__: ${typeof window !== 'undefined' ? (window as any).__MAPBOX_TOKEN__ || 'undefined' : 'N/A (SSR)'}

🔧 To fix this issue:

📍 For LOCAL DEVELOPMENT:
1. Create a .env file in project root (if not exists)
2. Add your Mapbox token:
   VITE_MAPBOX_TOKEN=pk.your_actual_token_here

3. Restart dev server:
   npm run dev

📍 For VERCEL DEPLOYMENT:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add variable with EXACT name: VITE_MAPBOX_TOKEN
   (NOT 'VITE_MAPBOX_PUBLIC_TOKEN' - use consistent naming)
3. Value: pk.your_actual_token_here
4. Environment: Production ✓ Preview ✓ Development ✓
5. ⚠️ **IMPORTANT**: Click "Redeploy" after adding the variable
   (New variables only take effect on new deployments)

📍 Get a FREE token:
   👉 https://account.mapbox.com/access-tokens/

📍 Emergency Runtime Fix (temporary):
   Add this to your HTML <head>:
   <script>window.__MAPBOX_TOKEN__ = 'pk.your_token_here';</script>

📚 Documentation:
   - Vite Env Variables: https://vitejs.dev/guide/env-and-mode.html
   - Vercel Env Variables: https://vercel.com/docs/environment-variables
   - Vercel Build Variables: https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
`
    console.error(errorMsg)
    throw new Error('Mapbox access token is missing. Check console for details.')
  }
  
  // Validate token format
  if (!token.startsWith('pk.')) {
    console.warn('⚠️ Mapbox token should start with "pk." - current token might be invalid')
  }
  
  console.log('✅ Mapbox token loaded successfully:', token.substring(0, 15) + '...')
}

// Safe viewport configuration with fallback values
export interface ViewportConfig {
  latitude: number
  longitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

export function createSafeViewport(config?: Partial<ViewportConfig>): ViewportConfig {
  // Validate coordinates to prevent NaN issues
  const lat = config?.latitude
  const lng = config?.longitude
  
  // Check for invalid coordinates
  const isValidLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90
  const isValidLng = typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180
  
  if (config?.latitude !== undefined && !isValidLat) {
    console.warn(`⚠️ Invalid latitude: ${lat}, using default: ${DEFAULT_MAP_CENTER.latitude}`)
  }
  if (config?.longitude !== undefined && !isValidLng) {
    console.warn(`⚠️ Invalid longitude: ${lng}, using default: ${DEFAULT_MAP_CENTER.longitude}`)
  }
  
  return {
    latitude: isValidLat ? lat! : DEFAULT_MAP_CENTER.latitude,
    longitude: isValidLng ? lng! : DEFAULT_MAP_CENTER.longitude,
    zoom: config?.zoom ?? DEFAULT_MAP_CENTER.zoom,
    pitch: config?.pitch ?? 0,
    bearing: config?.bearing ?? 0,
  }
}

// Map styles
export const MAP_STYLES = {
  DARK: 'mapbox://styles/mapbox/dark-v11',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const

// Default map style
export const DEFAULT_MAP_STYLE = MAP_STYLES.DARK
