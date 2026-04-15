import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = cookies();
  const token = cookieStore.get('njiani_admin_token')?.value;

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  const json = await res.json();
  // Unwrap standard { data: ... } envelope
  return (json?.data ?? json) as T;
}

export const serverApi = {
  get: <T>(path: string) => serverFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    serverFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    serverFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => serverFetch<T>(path, { method: 'DELETE' }),
};
