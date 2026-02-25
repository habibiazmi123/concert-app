import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly redis: Redis;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
    });
  }

  /**
   * Get sales analytics summary
   */
  async getSalesAnalytics() {
    const [
      totalRevenue,
      totalBookings,
      confirmedBookings,
      totalUsers,
      totalConcerts,
      recentBookings,
      revenueByMonth,
      topConcerts,
    ] = await Promise.all([
      // Total revenue from confirmed bookings
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      // Total booking count
      this.prisma.booking.count(),
      // Confirmed booking count
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      // Total users
      this.prisma.user.count(),
      // Total concerts
      this.prisma.concert.count(),
      // Recent bookings (last 30 days)
      this.prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Revenue by month (last 6 months)
      this.prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', p."paidAt"), 'YYYY-MM') as month,
          SUM(p.amount) as revenue,
          COUNT(p.id) as count
        FROM payments p
        WHERE p.status = 'COMPLETED'
          AND p."paidAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', p."paidAt")
        ORDER BY month DESC
      `,
      // Top concerts by revenue
      this.prisma.concert.findMany({
        select: {
          id: true,
          title: true,
          artist: true,
          venue: true,
          date: true,
          imageUrl: true,
          ticketTypes: {
            select: {
              totalSeats: true,
              availableSeats: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: { status: 'CONFIRMED' },
              },
            },
          },
        },
        orderBy: {
          bookings: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      overview: {
        totalRevenue: totalRevenue._sum.amount
          ? Number(totalRevenue._sum.amount)
          : 0,
        totalBookings,
        confirmedBookings,
        totalUsers,
        totalConcerts,
        recentBookings,
        conversionRate: totalBookings > 0
          ? ((confirmedBookings / totalBookings) * 100).toFixed(1) + '%'
          : '0%',
      },
      revenueByMonth: (revenueByMonth as any[]).map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
        count: Number(r.count),
      })),
      topConcerts: topConcerts.map((c) => ({
        ...c,
        totalSeats: c.ticketTypes.reduce((sum, tt) => sum + tt.totalSeats, 0),
        soldSeats: c.ticketTypes.reduce(
          (sum, tt) => sum + (tt.totalSeats - tt.availableSeats),
          0,
        ),
        confirmedBookings: c._count.bookings,
      })),
    };
  }

  /**
   * Get paginated booking logs
   */
  async getBookingLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          concert: {
            select: { title: true, venue: true, date: true },
          },
          bookingItems: {
            include: {
              ticketType: { select: { name: true } },
            },
          },
          payment: {
            select: { status: true, method: true, paidAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count(),
    ]);

    return {
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get queue status overview
   */
  async getQueueStatus() {
    const [waiting, processing, completed, failed, recentJobs] =
      await Promise.all([
        this.prisma.queueJob.count({ where: { status: 'WAITING' } }),
        this.prisma.queueJob.count({ where: { status: 'PROCESSING' } }),
        this.prisma.queueJob.count({ where: { status: 'COMPLETED' } }),
        this.prisma.queueJob.count({ where: { status: 'FAILED' } }),
        this.prisma.queueJob.findMany({
          include: {
            user: { select: { name: true, email: true } },
            concert: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    // Get Redis info
    let redisInfo: any = {};
    try {
      const info = await this.redis.info('clients');
      const memory = await this.redis.info('memory');
      redisInfo = {
        connectedClients: info.match(/connected_clients:(\d+)/)?.[1],
        usedMemory: memory.match(/used_memory_human:(.+)/)?.[1]?.trim(),
      };
    } catch {
      redisInfo = { error: 'Could not connect to Redis' };
    }

    return {
      counts: { waiting, processing, completed, failed },
      total: waiting + processing + completed + failed,
      redis: redisInfo,
      recentJobs,
    };
  }
}
