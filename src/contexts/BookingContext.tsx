// src/contexts/BookingContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Booking {
  id: number;
  client: any;
  service: any;
  provider: any;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  service_address: string;
  total_price: string;
  is_paid: boolean;
  client_notes: string;
  provider_notes: string;
  created_at: string;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: any) => Promise<Booking>;
  updateBookingStatus: (id: number, status: string) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  confirmBooking: (id: number) => Promise<void>;
  completeBooking: (id: number) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/bookings/');
      const data = response.data as { results?: Booking[] } | Booking[];
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data.results)) {
        setBookings(data.results);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any): Promise<Booking> => {
    const response = await axios.post('/bookings/', bookingData);
    const newBooking = response.data as Booking;
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const updateBookingStatus = async (id: number, status: string) => {
    const response = await axios.patch(`/bookings/${id}/`, { status });
    const updatedBooking = response.data as Booking;
    setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
  };

  const cancelBooking = async (id: number) => {
    const response = await axios.post(`/bookings/${id}/cancel/`);
    const updatedBooking = response.data as Booking;
    setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
  };

  const confirmBooking = async (id: number) => {
    const response = await axios.post(`/bookings/${id}/confirm/`);
    const updatedBooking = response.data as Booking;
    setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
  };

  const completeBooking = async (id: number) => {
    const response = await axios.post(`/bookings/${id}/complete/`);
    const updatedBooking = response.data as Booking;
    setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        fetchBookings,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        confirmBooking,
        completeBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings doit être utilisé à l\'intérieur d\'un BookingProvider');
  }
  return context;
};