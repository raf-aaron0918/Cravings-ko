import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'cravingsko2026';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', 'true', { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 });
    return res;
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_auth');
  return res;
}
