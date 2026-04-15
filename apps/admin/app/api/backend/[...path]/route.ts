import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const token = cookies().get('njiani_admin_token')?.value;
  const backendPath = params.path.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/v1/${backendPath}${search}`;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Forward body for mutating methods
  let body: BodyInit | undefined;
  const contentType = request.headers.get('content-type') ?? '';
  if (['POST', 'PATCH', 'PUT'].includes(request.method)) {
    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    }
  }

  const res = await fetch(url, { method: request.method, headers, body });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
