/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from 'src/users/user.service';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId,
    });

    console.log('Generated auth URL:', url); // ← Agrega este log
    console.log('With state (userId):', userId); // ← Y este

    return url;
  }

  async handleCallback(auth0Id: string, code: string) {
    try {
      console.log('🔄 Processing callback for user:', auth0Id);

      const { tokens } = await this.oauth2Client.getToken(code);

      console.log('🎫 Tokens received:', {
        hasRefreshToken: !!tokens.refresh_token,
        hasAccessToken: !!tokens.access_token,
      });

      // Update user with refresh token
      const result = await this.prisma.user.update({
        where: { auth0Id },
        data: {
          googleRefreshToken: tokens.refresh_token || '',
          googleCalendarId: 'primary',
        },
      });

      console.log('💾 User updated:', {
        auth0Id: result.auth0Id,
        hasRefreshToken: !!result.googleRefreshToken,
      });

      return {
        success: true,
        message: 'Google Calendar connected successfully',
      };
    } catch (error) {
      console.error('💥 Error in handleCallback:', error);
      throw new UnauthorizedException('Failed to connect Google Calendar');
    }
  }

  async disconnectCalendar(auth0Id: string) {
    await this.prisma.user.update({
      where: { auth0Id },
      data: {
        googleRefreshToken: null,
        googleCalendarId: null,
      },
    });

    return { success: true, message: 'Google Calendar disconnected' };
  }

  async getCalendarEvents(auth0Id: string, startTime: Date, endTime: Date) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.googleRefreshToken) {
      return [];
    }

    try {
      // Set the credentials
      this.oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  async checkGoogleCalendarConflicts(
    auth0Id: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const events = await this.getCalendarEvents(auth0Id, startTime, endTime);

    // Check if any event overlaps with our time range
    return events.some((event) => {
      if (!event.start?.dateTime || !event.end?.dateTime) return false;

      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Check for overlap
      return eventStart < endTime && eventEnd > startTime;
    });
  }

  async createCalendarEvent(auth0Id: string, booking: any) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.googleRefreshToken) {
      return null;
    }

    try {
      this.oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const event = {
        summary: booking.title,
        start: {
          dateTime: booking.startTime.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: booking.endTime.toISOString(),
          timeZone: 'America/New_York',
        },
        description: 'Created by Booking System',
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async deleteCalendarEvent(auth0Id: string, googleEventId: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.googleRefreshToken || !googleEventId) {
      return;
    }

    try {
      this.oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  }
}
