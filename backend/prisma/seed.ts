import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, ConcertStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
})

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Create Admin User ──────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@concert.com' },
    update: {},
    create: {
      email: 'admin@concert.com',
      password: adminPassword,
      name: 'Alex Rivera',
      role: UserRole.ADMIN,
      phone: '+1234567890',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ─── Create Test User ──────────────────────────────
  const userPassword = await bcrypt.hash('user1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@concert.com' },
    update: {},
    create: {
      email: 'user@concert.com',
      password: userPassword,
      name: 'Jordan Chen',
      role: UserRole.USER,
      phone: '+1987654321',
    },
  });
  console.log(`✅ Test user created: ${user.email}`);

  // ─── Create Concerts ────────────────────────────────
  const concerts = [
    {
      title: 'Summer Beats Festival',
      description:
        'The biggest summer music festival featuring top DJs and live performances. Three days of non-stop entertainment with over 50 artists across multiple stages.',
      artist: 'Various Artists',
      venue: 'SoFi Stadium',
      address: '1001 Stadium Dr',
      city: 'Los Angeles',
      date: new Date('2026-07-15T18:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      status: ConcertStatus.PUBLISHED,
      ticketTypes: [
        { name: 'General Admission', description: 'Standing area access', price: 89.00, totalSeats: 15000, sortOrder: 0 },
        { name: 'VIP', description: 'VIP lounge + priority entry', price: 249.00, totalSeats: 2000, sortOrder: 1 },
        { name: 'VVIP', description: 'Backstage access + meet & greet', price: 599.00, totalSeats: 200, sortOrder: 2 },
      ],
    },
    {
      title: 'Neon Nights: Global Tour',
      description:
        'Experience the electrifying Neon Nights global tour with stunning visual effects, immersive light shows, and world-class sound systems.',
      artist: 'The Midnight Echo',
      venue: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      date: new Date('2026-08-24T19:30:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      status: ConcertStatus.PUBLISHED,
      ticketTypes: [
        { name: 'Floor Standing', description: 'Floor level standing area', price: 125.00, totalSeats: 5000, sortOrder: 0 },
        { name: 'Lower Bowl', description: 'Lower bowl seating', price: 185.00, totalSeats: 8000, sortOrder: 1 },
        { name: 'Upper Bowl', description: 'Upper bowl seating', price: 75.00, totalSeats: 12000, sortOrder: 2 },
        { name: 'Platinum VIP', description: 'Front row + backstage + parking', price: 450.00, totalSeats: 500, sortOrder: 3 },
      ],
    },
    {
      title: 'Acoustic Sunset Sessions',
      description:
        'An intimate evening of acoustic performances under the stars. Enjoy craft beverages, gourmet food, and soulful melodies in a beautiful outdoor setting.',
      artist: 'Luna Waves',
      venue: 'Red Rocks Amphitheatre',
      address: '18300 W Alameda Pkwy',
      city: 'Denver',
      date: new Date('2026-06-20T17:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      status: ConcertStatus.PUBLISHED,
      ticketTypes: [
        { name: 'Standard', description: 'General seating', price: 65.00, totalSeats: 5000, sortOrder: 0 },
        { name: 'Premium', description: 'First 10 rows + drinks voucher', price: 120.00, totalSeats: 1000, sortOrder: 1 },
      ],
    },
    {
      title: 'Electronic Pulse Festival',
      description:
        'Two days of cutting-edge electronic music with world-renowned DJs. Multiple stages, art installations, and immersive experiences.',
      artist: 'Various Artists',
      venue: 'Bayfront Park',
      address: '301 Biscayne Blvd',
      city: 'Miami',
      date: new Date('2026-09-10T14:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      status: ConcertStatus.PUBLISHED,
      ticketTypes: [
        { name: 'Day Pass', description: 'Single day access', price: 99.00, totalSeats: 20000, sortOrder: 0 },
        { name: '2-Day Pass', description: 'Full festival access', price: 175.00, totalSeats: 15000, sortOrder: 1 },
        { name: 'VIP 2-Day', description: 'VIP area + fast lane + merchandise', price: 350.00, totalSeats: 3000, sortOrder: 2 },
      ],
    },
    {
      title: 'Jazz & Blues Night',
      description:
        'A sophisticated evening celebrating the rich tradition of jazz and blues. Featuring legendary performers in an intimate theater setting.',
      artist: 'Miles & Company',
      venue: 'Symphony Hall',
      address: '301 Massachusetts Ave',
      city: 'Boston',
      date: new Date('2026-05-30T20:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
      status: ConcertStatus.PUBLISHED,
      ticketTypes: [
        { name: 'Balcony', description: 'Balcony seating', price: 55.00, totalSeats: 800, sortOrder: 0 },
        { name: 'Orchestra', description: 'Orchestra level seating', price: 95.00, totalSeats: 1200, sortOrder: 1 },
        { name: 'Front Orchestra', description: 'First 5 rows + champagne', price: 175.00, totalSeats: 200, sortOrder: 2 },
      ],
    },
  ];

  for (const concertData of concerts) {
    const { ticketTypes, ...concert } = concertData;
    const created = await prisma.concert.create({
      data: {
        ...concert,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            ...tt,
            availableSeats: tt.totalSeats,
          })),
        },
      },
    });
    console.log(`✅ Concert created: ${created.title}`);
  }

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Admin login:  admin@concert.com / admin123');
  console.log('User login:   user@concert.com / user1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
