/**
 * Client-side API helper that routes all requests through the Next.js proxy
 * at /api/backend/[...path]. The proxy attaches the httpOnly JWT cookie as a
 * Bearer token on each request to the NestJS backend.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// next.config.mjs sets basePath: '/njiani-admin'. fetch() calls to app-relative
// paths aren't rewritten by Next automatically (unlike next/link or next/router),
// so it must be prepended by hand or every proxied request 404s.
const BASE_PATH = '/njiani-admin';

async function proxyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Strip leading /api/v1 if present, then route through the proxy
  const cleanPath = path.replace(/^\/api\/v1/, '').replace(/^\//, '');
  const url = `${BASE_PATH}/api/backend/${cleanPath}`;

  const res = await fetch(url, init);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.message ?? `Request failed: ${res.status}`);
  }

  const json = await res.json();
  // Paginated responses include a `meta` object alongside `data` — return them intact.
  if (json !== null && typeof json === 'object' && 'meta' in json) return json as T;
  return (json?.data ?? json) as T;
}

export const clientApi = {
  get: <T>(path: string, params?: Record<string, string>) => {
    const search = params ? '?' + new URLSearchParams(params).toString() : '';
    return proxyFetch<T>(`${path}${search}`);
  },
  post: <T>(path: string, body: unknown) =>
    proxyFetch<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    proxyFetch<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) => proxyFetch<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    proxyFetch<T>(path, { method: 'POST', body: formData }),
};
