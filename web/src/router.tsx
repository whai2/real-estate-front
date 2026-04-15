import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuthStore } from '@/stores/auth.store';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        lazy: () =>
          import('@/pages/dashboard/DashboardPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/map',
        lazy: () =>
          import('@/pages/map/MapPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/property/register',
        lazy: () =>
          import('@/pages/property-register/PropertyRegisterPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/property/manage',
        lazy: () =>
          import('@/pages/property-manage/PropertyManagePage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/tools/fee-calc',
        lazy: () =>
          import('@/pages/fee-calc/FeeCalcPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/tools/loan-calc',
        lazy: () =>
          import('@/pages/loan-calc/LoanCalcPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/notifications',
        lazy: () =>
          import('@/pages/notifications/NotificationsPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/property/open-site-register',
        lazy: () =>
          import('@/pages/open-site-register/OpenSiteRegisterPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/property/:id',
        lazy: () =>
          import('@/pages/property-detail/PropertyDetailPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/open-schedule',
        lazy: () =>
          import('@/pages/open-schedule/OpenSchedulePage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/favorites',
        lazy: () =>
          import('@/pages/favorites/FavoritesPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/point-history',
        lazy: () =>
          import('@/pages/point-history/PointHistoryPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/push-settings',
        lazy: () =>
          import('@/pages/push-settings/PushSettingsPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/settings',
        lazy: () =>
          import('@/pages/settings/SettingsPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/support/chat',
        lazy: () =>
          import('@/pages/support-chat/SupportChatPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/tools/customer-manage',
        lazy: () =>
          import('@/pages/customer-manage/CustomerManagePage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/support/inquiries',
        lazy: () =>
          import('@/pages/support-inquiries/SupportInquiriesPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/community/:id',
        lazy: () =>
          import('@/pages/community-detail/CommunityDetailPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/community',
        lazy: () =>
          import('@/pages/community/CommunityPage').then((m) => ({
            Component: () => (
              <AuthGuard>
                <m.default />
              </AuthGuard>
            ),
          })),
      },
      {
        path: '/login',
        lazy: () =>
          import('@/pages/login/LoginPage').then((m) => ({ Component: m.default })),
      },
      {
        path: '*',
        lazy: () =>
          import('@/pages/not-found/NotFoundPage').then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
]);
