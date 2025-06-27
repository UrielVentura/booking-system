import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('❌ No code parameter received');
      return redirect('/dashboard?google_connected=false');
    }

    if (!state) {
      console.error('❌ No state parameter received');
      return redirect('/dashboard?google_connected=false');
    }

    const session = await getSession();

    if (!session) {
      console.error('❌ No session found');
      return redirect('/dashboard?google_connected=false');
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/callback?code=${code}&state=${state}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend callback failed:', errorText);
      return redirect('/dashboard?google_connected=false');
    }

    return redirect('/dashboard?google_connected=true');
  } catch (error) {
    console.error('💥 Error handling calendar callback:', error);
    return redirect('/dashboard?google_connected=false');
  }
}
