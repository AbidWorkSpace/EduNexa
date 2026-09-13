import { createLazyView } from 'src/utils/dynamic-imports';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const GlaModuleDetailsView = createLazyView(
  () => import('src/sections/gla'),
  'GlaModuleDetailsView'
);

export const metadata = { title: `GLA Module Details | Dashboard - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const { id } = await params;

  return <GlaModuleDetailsView id={id} />;
}
