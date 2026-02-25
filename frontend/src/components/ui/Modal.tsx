'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        className={`card-brutal-static w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b-2 border-border-brutal px-6 py-4 flex items-center justify-between z-10 rounded-t-[var(--radius-brutal)]">
          <h3 className="text-lg font-bold font-heading text-ink">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border-2 border-border-brutal bg-surface hover:bg-secondary hover:text-white flex items-center justify-center transition-colors">
            <Icon name="close" className="text-sm" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
