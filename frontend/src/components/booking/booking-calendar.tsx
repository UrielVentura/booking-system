'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { Booking } from '@/lib/api/bookings';

interface BookingCalendarProps {
  bookings: Booking[];
  onDelete: (id: string) => void;
}

export function BookingCalendar({ bookings, onDelete }: BookingCalendarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleEventClick = (info: any) => {
    const booking = bookings.find((b) => b.id === info.event.id);
    if (booking) {
      setSelectedBooking(booking);
      setAnchorEl(info.el);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleDelete = () => {
    if (selectedBooking) {
      onDelete(selectedBooking.id);
      handleCloseMenu();
    }
  };

  const events = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    start: booking.startTime,
    end: booking.endTime,
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  }));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ height: 600 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView='timeGridWeek'
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime='08:00:00'
          slotMaxTime='20:00:00'
          height='100%'
          nowIndicator={true}
          editable={false}
          dayMaxEvents={true}
          weekends={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedBooking && (
          <>
            <MenuItem disabled>
              <Typography variant='subtitle2'>
                {selectedBooking.title}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant='caption' color='text.secondary'>
                {format(new Date(selectedBooking.startTime), 'PPp')}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              Delete Booking
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  );
}
