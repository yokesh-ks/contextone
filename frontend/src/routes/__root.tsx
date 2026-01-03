import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@/lib/auth-context';
import { Providers } from '@/providers';

function RootLayout() {
  console.log('RootLayout rendered');
  return (
    <Providers>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </Providers>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div>Not Found - Route not matched</div>,
});