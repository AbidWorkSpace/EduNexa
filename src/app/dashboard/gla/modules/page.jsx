import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const GlaModulesView = createLazyView(() => import('src/sections/gla'), 'GlaModulesView');

export const metadata = { title: `GLA Modules | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GlaModulesView />;
}
