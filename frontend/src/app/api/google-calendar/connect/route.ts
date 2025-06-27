import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log(
      'Making request to backend:',
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-url`
    );

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth-url`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend response not ok:', errorText);
      throw new Error('Backend request failed');
    }

    const data = await backendResponse.json();

    return NextResponse.json({
      authUrl: data.url,
    });
  } catch (error) {
    console.error('Error connecting calendar:', error);
    return NextResponse.json(
      { message: 'Failed to connect calendar' },
      { status: 500 }
    );
  }
}
