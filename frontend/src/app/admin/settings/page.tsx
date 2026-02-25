'use client';

import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure system-wide preferences."
      />
      <div className="card-brutal-static overflow-hidden">
        <div className="p-8 text-center text-ink-muted font-medium">
          <Icon name="settings" className="text-4xl mb-2 opacity-50" />
          <p>Settings panel coming soon.</p>
        </div>
      </div>
    </div>
  );
}
