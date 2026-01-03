import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const tenantId = params.get('tenant_id');
      const error = params.get('error');

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        navigate({ to: '/login' });
        return;
      }

      if (accessToken && refreshToken && tenantId) {
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('tenant_id', tenantId);

        // Check auth and redirect to dashboard
        await checkAuth();
        toast.success('Successfully signed in!');
        navigate({ to: '/dashboard' });
      } else {
        toast.error('Authentication failed: Missing credentials');
        navigate({ to: '/login' });
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});
