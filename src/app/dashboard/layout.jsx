import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';
import { SchoolConfigGate } from 'src/auth/school';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <SchoolConfigGate>
        <DashboardLayout>{children}</DashboardLayout>
      </SchoolConfigGate>
    </AuthGuard>
  );
}
