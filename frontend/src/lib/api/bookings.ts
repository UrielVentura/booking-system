import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  userId: string;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

class BookingsAPI {
  private async getToken() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.accessToken;
  }

  async getBookings(): Promise<Booking[]> {
    const token = await this.getToken();
    const response = await axios.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    const token = await this.getToken();
    const response = await axios.get(`${API_URL}/bookings/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const token = await this.getToken();
    const response = await axios.post(`${API_URL}/bookings`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async updateBooking(
    id: string,
    data: Partial<CreateBookingDto>
  ): Promise<Booking> {
    const token = await this.getToken();
    const response = await axios.put(`${API_URL}/bookings/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteBooking(id: string): Promise<void> {
    const token = await this.getToken();
    await axios.delete(`${API_URL}/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async checkConflicts(
    startTime: string,
    endTime: string
  ): Promise<{ hasConflicts: boolean; conflicts: Booking[] }> {
    const token = await this.getToken();
    const response = await axios.get(`${API_URL}/bookings/check-conflicts`, {
      params: { startTime, endTime },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

export const bookingsAPI = new BookingsAPI();
