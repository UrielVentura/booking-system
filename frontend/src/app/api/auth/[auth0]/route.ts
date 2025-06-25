import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';

const afterCallback = async (req: any, session: any) => {
  try {
    const idToken = session.idToken;

    const response = await fetch('http://localhost:3001/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: idToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync user with backend:', await response.text());
    } else {
      console.log('User synced successfully');
    }
  } catch (error) {
    console.error('Error syncing user:', error);
  }

  return session;
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});
