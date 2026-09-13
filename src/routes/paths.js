// ----------------------------------------------------------------------
// Route access (protected / moderate / public) is defined in route-access.js
// and is config-driven (key-based) for generic, dynamic behavior.

export const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

const paths = {
  comingSoon: '/coming-soon',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  pages: '/pages',
  docs: '/docs',
  termsOfService: '/terms-of-service',
  privacyPolicy: '/privacy-policy',
  minimalStore: '#',
  aiAssistant: ROOTS.DASHBOARD,
  // AUTH
  auth: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    resetPassword: '/reset-password',
    updatePassword: '/update-password',
    verify: '/verify',
  },
  /** Default website navigation target (root "/" and "Home" links redirect here). Keep in sync with auth.signIn when home should be sign-in. */
  home: '/sign-in',
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    overview: `${ROOTS.DASHBOARD}/overview`,
    gla: `${ROOTS.DASHBOARD}/gla`,
    glaModules: `${ROOTS.DASHBOARD}/gla/modules`,
    glaModuleDetails: (id) => `${ROOTS.DASHBOARD}/gla/modules/${id}`,
    glaReview: `${ROOTS.DASHBOARD}/gla/review`,
    schoolSettings: `${ROOTS.DASHBOARD}/settings/school`,
  },
};

export { paths };
