import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const SchoolThemeBuilderView = createLazyView(() => import('src/sections/school'), 'SchoolThemeBuilderView');

export const metadata = { title: `Theme Builder | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SchoolThemeBuilderView />;
}
