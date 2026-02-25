import { Icon } from '@/components/ui/Icon';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ icon, label, value, sub, color = 'bg-primary' }: StatCardProps) {
  return (
    <div className="card-brutal-static p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${color} border-2 border-border-brutal flex items-center justify-center`}>
          <Icon name={icon} className="text-xl text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold font-heading text-ink">{value}</p>
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</p>
          {sub && <p className="text-xs text-ink-light mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
