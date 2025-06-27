/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConnectGoogleDto } from './dto/connect-google.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify Auth0 token and create/update user' })
  async verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyAndCreateUser(body.token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('google/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect Google Calendar' })
  async connectGoogle(@Request() req, @Body() dto: ConnectGoogleDto) {
    return this.authService.connectGoogleCalendar(req.user.userId, dto.code);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Request() req, @Res() res: Response) {
    const { code } = req.query;
    res.redirect(`http://localhost:3000/connect-google?code=${code}`);
  }
}
