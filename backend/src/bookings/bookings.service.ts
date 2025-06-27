import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { google } from 'googleapis';
import { GoogleCalendarService } from 'src/google/google-calendar.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GoogleCalendarService))
    private googleCalendarService: GoogleCalendarService,
  ) {}

  async create(
    auth0Id: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    // First, get the user by auth0Id
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    // Validate times
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot create bookings in the past');
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts(user.id, startTime, endTime);
    if (conflicts.length > 0) {
      throw new BadRequestException(
        'Time slot conflicts with existing booking',
      );
    }

    // Check for Google Calendar conflicts
    const hasGoogleConflicts =
      await this.googleCalendarService.checkGoogleCalendarConflicts(
        auth0Id,
        startTime,
        endTime,
      );
    if (hasGoogleConflicts) {
      throw new BadRequestException(
        'Time slot conflicts with your Google Calendar',
      );
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        title: createBookingDto.title,
        startTime,
        endTime,
        userId: user.id,
      },
    });

    // Try to create event in Google Calendar
    const googleEvent = await this.googleCalendarService.createCalendarEvent(
      auth0Id,
      booking,
    );
    if (googleEvent?.id) {
      // Update booking with Google Event ID
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: googleEvent.id },
      });
    }

    return booking;
  }

  async findAll(auth0Id: string): Promise<Booking[]> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return [];
    }

    return this.prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, auth0Id: string): Promise<Booking> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id, userId: user.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(
    id: string,
    auth0Id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const booking = await this.findOne(id, auth0Id);

    const startTime = updateBookingDto.startTime
      ? new Date(updateBookingDto.startTime)
      : booking.startTime;
    const endTime = updateBookingDto.endTime
      ? new Date(updateBookingDto.endTime)
      : booking.endTime;

    // Validate times
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts (excluding current booking)
    const conflicts = await this.checkConflicts(
      user.id,
      startTime,
      endTime,
      id,
    );
    if (conflicts.length > 0) {
      throw new BadRequestException(
        'Time slot conflicts with existing booking',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        title: updateBookingDto.title,
        startTime,
        endTime,
      },
    });
  }

  async remove(id: string, auth0Id: string): Promise<Booking> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Delete from Google Calendar if connected
    if (booking.googleEventId) {
      await this.googleCalendarService.deleteCalendarEvent(
        auth0Id,
        booking.googleEventId,
      );
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async checkConflicts(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        userId,
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          {
            // New booking starts during existing booking
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            // New booking ends during existing booking
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            // New booking completely contains existing booking
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });
  }

  async getUpcomingBookings(auth0Id: string): Promise<Booking[]> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return [];
    }

    return this.prisma.booking.findMany({
      where: {
        userId: user.id,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });
  }

  async checkGoogleCalendarConflicts(
    accessToken: string,
    startTime: string,
    endTime: string,
  ) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    return events && events.length > 0;
  }
}
