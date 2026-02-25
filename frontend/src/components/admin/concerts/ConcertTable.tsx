import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import type { Concert } from '@/lib/types';

interface ConcertTableProps {
  concerts: Concert[];
  loading: boolean;
  onEdit: (concert: Concert) => void;
  onDelete: (concert: Concert) => void;
}

export function ConcertTable({ concerts, loading, onEdit, onDelete }: ConcertTableProps) {
  return (
    <DataTable
      loading={loading}
      data={concerts}
      keyExtractor={(c) => c.id}
      emptyIcon="event"
      emptyMessage="No concerts found."
      columns={[
        {
          key: 'concert',
          header: 'Concert',
          render: (c) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border-2 border-border-brutal bg-surface-alt overflow-hidden shrink-0">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="music_note" className="text-ink-muted" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-ink">{c.title}</p>
                <p className="text-xs text-ink-muted">{c.artist}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'date',
          header: 'Date',
          render: (c) => (
            <span className="text-ink-muted font-medium">
              {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ),
        },
        {
          key: 'venue',
          header: 'Venue',
          render: (c) => (
            <div>
              <p className="text-ink font-medium">{c.venue}</p>
              <p className="text-xs text-ink-light">{c.city}</p>
            </div>
          ),
        },
        {
          key: 'tickets',
          header: 'Tickets',
          render: (c) => {
            const total = c.ticketTypes.reduce((s, tt) => s + tt.totalSeats, 0);
            const sold = c.ticketTypes.reduce((s, tt) => s + (tt.totalSeats - tt.availableSeats), 0);
            return (
              <>
                <span className="font-bold text-ink">{sold}</span>
                <span className="text-ink-light">/{total}</span>
              </>
            );
          },
        },
        {
          key: 'status',
          header: 'Status',
          render: (c) => <StatusBadge status={c.status} />,
        },
        {
          key: 'actions',
          header: 'Actions',
          className: 'text-right',
          render: (c) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEdit(c)}
                className="w-8 h-8 rounded-lg border-2 border-border-brutal bg-surface hover:bg-accent-yellow flex items-center justify-center transition-colors"
                title="Edit"
              >
                <Icon name="edit" className="text-sm" />
              </button>
              <button
                onClick={() => onDelete(c)}
                className="w-8 h-8 rounded-lg border-2 border-border-brutal bg-surface hover:bg-secondary hover:text-white flex items-center justify-center transition-colors"
                title="Delete"
              >
                <Icon name="delete" className="text-sm" />
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}
