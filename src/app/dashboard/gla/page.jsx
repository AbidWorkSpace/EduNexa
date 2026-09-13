import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const GlaPocView = createLazyView(() => import('src/sections/gla'), 'GlaPocView');

export const metadata = { title: `GLA POC | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GlaPocView />;
}
