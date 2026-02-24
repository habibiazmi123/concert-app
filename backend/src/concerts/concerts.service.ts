import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  type CreateConcertDto,
  type UpdateConcertDto,
  type AddTicketTypeDto,
  type UpdateTicketTypeDto,
  type ConcertQueryDto,
} from './dto/concert.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConcertsService {
  private readonly logger = new Logger(ConcertsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConcertDto) {
    const { ticketTypes, ...concertData } = dto;

    const concert = await this.prisma.concert.create({
      data: {
        ...concertData,
        date: new Date(concertData.date),
        ticketTypes: {
          create: ticketTypes.map((tt, index) => ({
            ...tt,
            availableSeats: tt.totalSeats,
            sortOrder: tt.sortOrder ?? index,
          })),
        },
      },
      include: {
        ticketTypes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    this.logger.log(`Concert created: ${concert.title} (${concert.id})`);
    return concert;
  }

  async findAll(query: ConcertQueryDto) {
    const { page, limit, search, city, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ConcertWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    const [concerts, total] = await Promise.all([
      this.prisma.concert.findMany({
        where,
        include: {
          ticketTypes: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.concert.count({ where }),
    ]);

    return {
      data: concerts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllPublished(query: ConcertQueryDto) {
    return this.findAll({ ...query, status: 'PUBLISHED' });
  }

  async findById(id: string) {
    const concert = await this.prisma.concert.findUnique({
      where: { id },
      include: {
        ticketTypes: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    return concert;
  }

  async update(id: string, dto: UpdateConcertDto) {
    await this.findById(id);

    const updateData: any = { ...dto };
    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    return this.prisma.concert.update({
      where: { id },
      data: updateData,
      include: {
        ticketTypes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    const hasConfirmedBookings = await this.prisma.booking.count({
      where: { concertId: id, status: 'CONFIRMED' },
    });

    if (hasConfirmedBookings > 0) {
      throw new BadRequestException(
        'Cannot delete concert with confirmed bookings. Cancel the concert instead.',
      );
    }

    await this.prisma.concert.delete({ where: { id } });
    return { message: 'Concert deleted successfully' };
  }

  async addTicketType(concertId: string, dto: AddTicketTypeDto) {
    await this.findById(concertId);

    return this.prisma.ticketType.create({
      data: {
        ...dto,
        concertId,
        availableSeats: dto.totalSeats,
      },
    });
  }

  async updateTicketType(ticketTypeId: string, dto: UpdateTicketTypeDto) {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    const updateData: any = { ...dto };

    if (dto.totalSeats !== undefined) {
      const diff = dto.totalSeats - ticketType.totalSeats;
      const newAvailable = ticketType.availableSeats + diff;

      if (newAvailable < 0) {
        throw new BadRequestException(
          'Cannot reduce total seats below the number of sold seats',
        );
      }

      updateData.availableSeats = newAvailable;
    }

    return this.prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: updateData,
    });
  }

  async deleteTicketType(ticketTypeId: string) {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        _count: { select: { bookingItems: true } },
      },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType._count.bookingItems > 0) {
      throw new BadRequestException(
        'Cannot delete ticket type with existing bookings',
      );
    }

    await this.prisma.ticketType.delete({ where: { id: ticketTypeId } });
    return { message: 'Ticket type deleted successfully' };
  }
}
