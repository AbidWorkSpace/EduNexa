import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name) => <Iconify width={22} icon={name} />;

const ICONS = {
  home: icon('solar:home-2-outline'),
  gla: icon('solar:clipboard-list-outline'),
  modules: icon('solar:widget-5-outline'),
  review: icon('solar:checklist-minimalistic-outline'),
  school: icon('solar:settings-outline'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Home',
        path: paths.dashboard.overview,
        icon: ICONS.home,
      },
    ],
  },
  {
    subheader: 'GLA POC',
    items: [
      {
        title: 'Planning workspace',
        path: paths.dashboard.gla,
        icon: ICONS.gla,
      },
      {
        title: 'Modules',
        path: paths.dashboard.glaModules,
        icon: ICONS.modules,
      },
      {
        title: 'Review',
        path: paths.dashboard.glaReview,
        icon: ICONS.review,
      },
    ],
  },
  {
    subheader: 'Platform',
    items: [
      {
        title: 'School branding',
        path: paths.dashboard.schoolSettings,
        icon: ICONS.school,
      },
    ],
  },
];
