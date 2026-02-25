'use client';

import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticket Management"
        subtitle="View and manage all ticket types and inventory."
      />
      <div className="card-brutal-static overflow-hidden">
        <div className="p-8 text-center text-ink-muted font-medium">
          <Icon name="local_activity" className="text-4xl mb-2 opacity-50" />
          <p>Ticket management panel coming soon.</p>
        </div>
      </div>
    </div>
  );
}
