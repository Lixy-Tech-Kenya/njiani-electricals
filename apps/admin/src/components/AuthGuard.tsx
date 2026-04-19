import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { api } from '@/lib/api/client';

export default function AuthGuard() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauth'>('loading');

  useEffect(() => {
    api.auth.me()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center text-gray-400">
        Loading...
      </div>
    );
  }
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return <Outlet />;
}
