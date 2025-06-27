import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('test')
@Controller('test')
export class TestController {
  @Get('auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  testAuth(@Request() req) {
    return {
      message: 'Authentication successful',
      user: req.user,
      headers: req.headers.authorization,
    };
  }

  @Get('public')
  testPublic() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }
}
