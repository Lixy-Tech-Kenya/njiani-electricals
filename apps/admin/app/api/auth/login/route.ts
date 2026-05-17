import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Invalid credentials' }));
    return NextResponse.json(
      { message: error.message ?? 'Invalid credentials' },
      { status: res.status },
    );
  }

  const data = await res.json();
  const token: string = data?.token ?? data?.access_token ?? data?.data?.token;

  if (!token) {
    return NextResponse.json({ message: 'No token returned from server' }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('njiani_admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
