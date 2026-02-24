// ─── User ──────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Concert ───────────────────────────────────────

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  sortOrder: number;
  concertId: string;
}

export type ConcertStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface Concert {
  id: string;
  title: string;
  description: string;
  artist: string;
  venue: string;
  address: string;
  city: string;
  date: string;
  imageUrl?: string | null;
  status: ConcertStatus;
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ConcertQuery {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: ConcertStatus;
  sortBy?: 'date' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Booking ───────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface BookingItem {
  id: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  ticketType: TicketType;
}

export interface Booking {
  id: string;
  userId: string;
  concertId: string;
  status: BookingStatus;
  totalAmount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  concert: Concert;
  items: BookingItem[];
  payment?: Payment;
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface CreateBookingRequest {
  concertId: string;
  items: { ticketTypeId: string; quantity: number }[];
}

export interface EnqueueBookingResponse {
  queueJobId: string;
  position: number;
  message: string;
}

export interface QueueStatus {
  id: string;
  bookingId?: string | null;
  userId: string;
  concertId: string;
  status: 'WAITING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  position: number | null;
  errorMsg?: string | null;
  error?: string;
}

// ─── Payment ───────────────────────────────────────

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: string;
  transactionId?: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  method: PaymentMethod;
}
