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

    console.log('🎯 Google callback received:', {
      code: code.substring(0, 20) + '...',
      state,
    });

    const session = await getSession();

    if (!session) {
      console.error('❌ No session found');
      return redirect('/dashboard?google_connected=false');
    }

    // ✅ CRÍTICO: Llamar al backend para procesar el código
    console.log('🔄 Calling backend to process callback...');

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

    console.log('📡 Backend callback response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend callback failed:', errorText);
      return redirect('/dashboard?google_connected=false');
    }

    console.log('✅ Backend callback successful');
    return redirect('/dashboard?google_connected=true');
  } catch (error) {
    console.error('💥 Error handling calendar callback:', error);
    return redirect('/dashboard?google_connected=false');
  }
}
