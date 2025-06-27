import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('google-calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Calendar authorization URL' })
  getAuthUrl(@Request() req) {
    const url = this.googleCalendarService.getAuthUrl(req.user.userId);
    return { url };
  }

  @Get('callback')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Handle Google Calendar OAuth callback' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!state || !code) {
        throw new Error('Missing state or code parameter');
      }

      await this.googleCalendarService.handleCallback(state, code);
      // Redirect to frontend success page
      res.redirect('http://localhost:3000/dashboard?google_connected=true');
    } catch (error) {
      console.error('❌ Callback error:', error);
      // Redirect to frontend error page
      res.redirect('http://localhost:3000/dashboard?google_connected=false');
    }
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect Google Calendar' })
  async connectCalendar(@Request() req, @Query('code') code: string) {
    return this.googleCalendarService.handleCallback(req.user.userId, code);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  async disconnectCalendar(@Request() req) {
    return this.googleCalendarService.disconnectCalendar(req.user.userId);
  }

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Calendar events' })
  async getEvents(
    @Request() req,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const events = await this.googleCalendarService.getCalendarEvents(
      req.user.userId,
      new Date(startTime),
      new Date(endTime),
    );
    return { events };
  }

  @Get('check-conflicts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check for Google Calendar conflicts' })
  async checkConflicts(
    @Request() req,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const hasConflicts =
      await this.googleCalendarService.checkGoogleCalendarConflicts(
        req.user.userId,
        new Date(startTime),
        new Date(endTime),
      );
    return { hasConflicts };
  }
}
