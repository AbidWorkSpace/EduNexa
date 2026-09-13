import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const OverviewView = createLazyView(
  () => import('src/sections/overview/overview-view'),
  'OverviewView'
);

export const metadata = { title: `Home | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewView />;
}
