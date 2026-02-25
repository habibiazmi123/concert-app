interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold font-heading text-ink">{title}</h2>
        {subtitle && <p className="text-ink-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
