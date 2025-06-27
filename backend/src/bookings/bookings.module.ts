import { forwardRef, Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { GoogleCalendarModule } from 'src/google/google-calendar.module';

@Module({
  imports: [forwardRef(() => GoogleCalendarModule)],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
