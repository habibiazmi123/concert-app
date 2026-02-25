import { Icon } from '@/components/ui/Icon';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyIcon?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyIcon = 'inbox',
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  if (loading) {
    return <div className="p-8 text-center text-ink-muted font-medium">Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-ink-muted">
        <Icon name={emptyIcon} className="text-4xl mb-2 opacity-50" />
        <p className="font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border-brutal bg-surface-alt">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 font-bold text-ink uppercase text-xs tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-border-brutal/30 hover:bg-surface-alt/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
