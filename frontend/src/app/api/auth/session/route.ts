// app/api/auth/session/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getSession();

  return NextResponse.json({ session }, { status: 200 });
}
