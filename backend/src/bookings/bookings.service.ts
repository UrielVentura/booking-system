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
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot create bookings in the past');
    }

    const conflicts = await this.checkConflicts(user.id, startTime, endTime);
    if (conflicts.length > 0) {
      throw new BadRequestException(
        'Time slot conflicts with existing booking',
      );
    }

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

    const booking = await this.prisma.booking.create({
      data: {
        title: createBookingDto.title,
        startTime,
        endTime,
        userId: user.id,
      },
    });

    const googleEvent = await this.googleCalendarService.createCalendarEvent(
      auth0Id,
      booking,
    );
    if (googleEvent?.id) {
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

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

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

    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const hasGoogleConflicts =
        await this.googleCalendarService.checkGoogleCalendarConflicts(
          auth0Id,
          startTime,
          endTime,
          booking.googleEventId,
        );
      if (hasGoogleConflicts) {
        throw new BadRequestException(
          'Time slot conflicts with your Google Calendar',
        );
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        title: updateBookingDto.title || booking.title,
        startTime,
        endTime,
      },
    });

    if (booking.googleEventId) {
      try {
        await this.googleCalendarService.updateCalendarEvent(
          auth0Id,
          booking.googleEventId,
          updatedBooking,
        );
      } catch (error) {
        console.error('Failed to update Google Calendar event:', error);
      }
    }

    return updatedBooking;
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
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
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
