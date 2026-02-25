import { Icon } from '@/components/ui/Icon';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
      <div className="card-brutal-static w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 border-2 border-border-brutal flex items-center justify-center">
            <Icon name="warning" className="text-2xl text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-ink">{title}</h3>
            <p className="text-xs text-ink-muted">This action cannot be undone.</p>
          </div>
        </div>
        <div className="text-sm text-ink-muted mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-brutal btn-ghost text-sm py-2">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-brutal btn-secondary text-sm py-2">
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
