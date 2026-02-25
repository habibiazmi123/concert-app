'use client';

import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Logs"
        subtitle="Review customer orders and payments."
      />
      <div className="card-brutal-static overflow-hidden">
        <div className="p-8 text-center text-ink-muted font-medium">
          <Icon name="receipt_long" className="text-4xl mb-2 opacity-50" />
          <p>Order history and transaction logs pending integration with NestJS API.</p>
        </div>
      </div>
    </div>
  );
}
