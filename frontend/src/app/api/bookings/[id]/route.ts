import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, startTime, endTime } = body;

    if (!title && !startTime && !endTime) {
      return NextResponse.json(
        {
          message: 'At least one field must be provided for update',
        },
        { status: 400 }
      );
    }

    console.log(
      'Making request to backend:',
      `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.id}`
    );

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
        }),
      }
    );

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend response not ok:', errorText);

      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { message: errorData.message || 'Failed to update booking' },
          { status: backendResponse.status }
        );
      } catch {
        return NextResponse.json(
          { message: 'Failed to update booking' },
          { status: backendResponse.status }
        );
      }
    }

    const updatedBooking = await backendResponse.json();
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
