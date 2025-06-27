import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for current user' })
  findAll(@Request() req) {
    return this.bookingsService.findAll(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings' })
  getUpcoming(@Request() req) {
    return this.bookingsService.getUpcomingBookings(req.user.userId);
  }

  @Get('check-conflicts')
  @ApiOperation({ summary: 'Check for conflicts in a time range' })
  async checkConflicts(
    @Request() req,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const conflicts = await this.bookingsService.checkConflicts(
      req.user.userId,
      new Date(startTime),
      new Date(endTime),
      excludeId,
    );
    return { hasConflicts: conflicts.length > 0, conflicts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookingsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, req.user.userId, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  remove(@Request() req, @Param('id') id: string) {
    return this.bookingsService.remove(id, req.user.userId);
  }
}
