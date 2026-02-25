const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-ink-light/20', text: 'text-ink-muted' },
  PUBLISHED: { bg: 'bg-accent/20', text: 'text-accent' },
  CANCELLED: { bg: 'bg-secondary/20', text: 'text-secondary' },
  COMPLETED: { bg: 'bg-primary/20', text: 'text-primary' },
  CONFIRMED: { bg: 'bg-accent/20', text: 'text-accent' },
  PENDING: { bg: 'bg-accent-yellow/40', text: 'text-ink' },
  WAITING: { bg: 'bg-accent-yellow/40', text: 'text-ink' },
  PROCESSING: { bg: 'bg-primary/20', text: 'text-primary' },
  FAILED: { bg: 'bg-secondary/20', text: 'text-secondary' },
  EXPIRED: { bg: 'bg-ink-light/20', text: 'text-ink-muted' },
};

const DEFAULT_STYLE = { bg: 'bg-ink-light/20', text: 'text-ink-muted' };

export function StatusBadge({ status }: { status: string }) {
  const style = BADGE_STYLES[status] || DEFAULT_STYLE;
  return (
    <span className={`badge-brutal ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}
