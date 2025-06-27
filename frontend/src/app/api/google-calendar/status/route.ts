import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ connected: false });
    }

    const testDate = new Date();
    const params = new URLSearchParams({
      startTime: testDate.toISOString(),
      endTime: new Date(testDate.getTime() + 3600000).toISOString(),
    });

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/check-conflicts?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (backendResponse.status === 401) {
      return NextResponse.json({ connected: false });
    }

    if (backendResponse.ok) {
      return NextResponse.json({
        connected: true,
        email: session.user?.email || 'Connected',
      });
    } else {
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json({ connected: false });
  }
}
