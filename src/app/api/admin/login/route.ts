import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/config/appConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === APP_CONFIG.adminPassword) {
      return NextResponse.json({ success: true, authenticated: true });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
