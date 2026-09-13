'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { getDefaultRedirectPath } from 'src/utils/get-default-redirect-path';

// ----------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getDefaultRedirectPath());
  }, [router]);

  return null;
}
