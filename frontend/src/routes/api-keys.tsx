import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import ApiKeysPage from '@/pages/ApiKeysPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  return children;
}

export const Route = createFileRoute('/api-keys')({
  component: () => (
    <AuthGuard>
      <ApiKeysPage />
    </AuthGuard>
  ),
});
