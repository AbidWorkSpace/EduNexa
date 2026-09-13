import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

const ASSETS = process.env.NEXT_PUBLIC_ASSETS_DIR ?? '/';

export const CONFIG = {
  appName: 'Minimal Dashboard',
  /** Logo paths for theme-aware display (dark mode vs light mode) */
  logo: {
    faviconDark: `${ASSETS}logo/house-logo.png`,
    faviconLight: `${ASSETS}logo/house-logo.png`,
  },
  appDescription:
    'Production-ready Next.js dashboard theme with MUI. Add your product routes and API when you are ready.',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  assetsDir: ASSETS,
  isStaticExport: JSON.parse(process.env.BUILD_STATIC_EXPORT ?? 'false'),
  /**
   * Site URL (for SEO JSON-LD schemas)
   */
  site: {
    basePath: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://minimal-dashboard.com',
  },
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: true,
    redirectPath: paths.dashboard.overview,
  },
  /**
   * Google Maps
   */
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  /**
   * Mapbox
   */
  mapboxApiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? '',
};
