import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ accessToken: session.accessToken });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      { message: 'Failed to get access token' },
      { status: 500 }
    );
  }
}
