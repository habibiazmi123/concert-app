import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Auth ────────────────────────────────────────────

export class RegisterBody {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 100 })
  password: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 100 })
  name: string;

  @ApiPropertyOptional({ example: '+6281234567890' })
  phone?: string;
}

export class LoginBody {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class RefreshTokenBody {
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}

export class AuthTokenResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: object;
}

// ─── Concerts ────────────────────────────────────────

export class TicketTypeBody {
  @ApiProperty({ example: 'VIP', maxLength: 100 })
  name: string;

  @ApiPropertyOptional({ example: 'Front row access with meet & greet' })
  description?: string;

  @ApiProperty({ example: 500000, minimum: 0 })
  price: number;

  @ApiProperty({ example: 100, minimum: 1 })
  totalSeats: number;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  sortOrder?: number;
}

export class CreateConcertBody {
  @ApiProperty({ example: 'Summer Music Festival 2026', minLength: 2, maxLength: 200 })
  title: string;

  @ApiProperty({ example: 'An amazing outdoor concert featuring top artists', minLength: 10 })
  description: string;

  @ApiProperty({ example: 'Taylor Swift', maxLength: 200 })
  artist: string;

  @ApiProperty({ example: 'Jakarta Convention Center', maxLength: 200 })
  venue: string;

  @ApiProperty({ example: 'Jl. Gatot Subroto, Jakarta', maxLength: 500 })
  address: string;

  @ApiProperty({ example: 'Jakarta', maxLength: 100 })
  city: string;

  @ApiProperty({ example: '2026-06-15T19:00:00.000Z', description: 'ISO 8601 datetime' })
  date: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'], default: 'DRAFT' })
  status?: string;

  @ApiProperty({ type: [TicketTypeBody], minItems: 1 })
  ticketTypes: TicketTypeBody[];
}

export class UpdateConcertBody {
  @ApiPropertyOptional({ example: 'Updated Concert Title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description for the concert' })
  description?: string;

  @ApiPropertyOptional({ example: 'New Artist' })
  artist?: string;

  @ApiPropertyOptional({ example: 'New Venue' })
  venue?: string;

  @ApiPropertyOptional({ example: 'New Address' })
  address?: string;

  @ApiPropertyOptional({ example: 'Bandung' })
  city?: string;

  @ApiPropertyOptional({ example: '2026-07-20T20:00:00.000Z' })
  date?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg', nullable: true })
  imageUrl?: string | null;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] })
  status?: string;
}

export class UpdateTicketTypeBody {
  @ApiPropertyOptional({ example: 'VIP Gold' })
  name?: string;

  @ApiPropertyOptional({ example: 'Premium front row experience' })
  description?: string;

  @ApiPropertyOptional({ example: 750000 })
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  totalSeats?: number;

  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;
}

// ─── Bookings ────────────────────────────────────────

export class BookingItemBody {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', format: 'uuid' })
  ticketTypeId: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 10 })
  quantity: number;
}

export class CreateBookingBody {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', format: 'uuid' })
  concertId: string;

  @ApiProperty({ type: [BookingItemBody], minItems: 1, maxItems: 5 })
  items: BookingItemBody[];
}

// ─── Payments ────────────────────────────────────────

export class CreatePaymentBody {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', format: 'uuid' })
  bookingId: string;
}

// ─── Users ───────────────────────────────────────────

export class UpdateUserBody {
  @ApiPropertyOptional({ example: 'Jane Doe', minLength: 2, maxLength: 100 })
  name?: string;

  @ApiPropertyOptional({ example: '+6281234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;
}
