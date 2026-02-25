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
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="music_note" className="text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{c.title}</p>
                <p className="text-xs text-slate-500">{c.artist}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'date',
          header: 'Date',
          render: (c) => (
            <span className="text-slate-600 dark:text-slate-300">
              {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ),
        },
        {
          key: 'venue',
          header: 'Venue',
          render: (c) => (
            <div>
              <p className="text-slate-600 dark:text-slate-300">{c.venue}</p>
              <p className="text-xs text-slate-400">{c.city}</p>
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
                <span className="font-medium text-slate-900 dark:text-white">{sold}</span>
                <span className="text-slate-400">/{total}</span>
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
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <Icon name="edit" className="text-lg" />
              </button>
              <button
                onClick={() => onDelete(c)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Delete"
              >
                <Icon name="delete" className="text-lg" />
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}
