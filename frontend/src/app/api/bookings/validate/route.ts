import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, startTime, endTime } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        {
          message: 'Missing required fields',
          valid: false,
        },
        { status: 400 }
      );
    }

    console.log(
      'Making request to backend:',
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/check-conflicts`
    );

    const params = new URLSearchParams({
      startTime: startTime,
      endTime: endTime,
    });

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/check-conflicts?${params}`,
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

      return NextResponse.json({
        valid: true,
        conflicts: [],
      });
    }

    const conflictsData = await backendResponse.json();

    const hasConflicts = conflictsData.hasConflicts || false;

    const conflicts = hasConflicts
      ? [
          {
            type: 'calendar',
            title: 'Google Calendar Event',
            startTime: startTime,
            endTime: endTime,
          },
        ]
      : [];

    return NextResponse.json({
      valid: !hasConflicts,
      conflicts: conflicts,
    });
  } catch (error) {
    console.error('Error validating booking:', error);
    return NextResponse.json({
      valid: true,
      conflicts: [],
    });
  }
}
