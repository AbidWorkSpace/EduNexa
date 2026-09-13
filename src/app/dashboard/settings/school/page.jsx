import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const SchoolSettingsView = createLazyView(() => import('src/sections/school'), 'SchoolSettingsView');

export const metadata = { title: `School branding | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SchoolSettingsView />;
}
