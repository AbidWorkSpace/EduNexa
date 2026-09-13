import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const GlaReviewView = createLazyView(() => import('src/sections/gla'), 'GlaReviewView');

export const metadata = { title: `GLA Review | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GlaReviewView />;
}
