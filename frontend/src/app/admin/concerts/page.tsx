'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ConcertFormModal } from '@/components/admin/concerts/ConcertFormModal';
import { ConcertTable } from '@/components/admin/concerts/ConcertTable';
import { useAdminConcerts, useDeleteConcert } from '@/hooks/queries/useConcerts';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Concert, ConcertStatus } from '@/lib/types';

export default function AdminConcertsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<ConcertStatus | ''>('');

  const { data, isLoading } = useAdminConcerts({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteConcert();
  const [showForm, setShowForm] = useState(false);
  const [editConcert, setEditConcert] = useState<Concert | null>(null);
  const [deleteConcert, setDeleteConcert] = useState<Concert | null>(null);

  const concerts = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteConcert) return;
    try {
      await deleteMutation.mutateAsync(deleteConcert.id);
      showSuccessToast('Concert deleted');
      setDeleteConcert(null);
    } catch (error) {
      showErrorToast(error, 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concerts & Events"
        subtitle="Manage your events, artists, and venues."
        action={
          <button
            onClick={() => { setEditConcert(null); setShowForm(true); }}
            className="btn-brutal btn-primary text-sm"
          >
            <Icon name="add" className="text-lg" />
            Create Event
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light text-lg" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search concerts..."
            className="input-brutal !pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as ConcertStatus | ''); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-brutal-static overflow-hidden">
        <ConcertTable
          concerts={concerts}
          loading={isLoading}
          onEdit={(c) => { setEditConcert(c); setShowForm(true); }}
          onDelete={setDeleteConcert}
        />
        {meta && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ConcertFormModal
          concert={editConcert}
          onClose={() => { setShowForm(false); setEditConcert(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteConcert}
        onClose={() => setDeleteConcert(null)}
        onConfirm={handleDelete}
        title="Delete Concert"
        message={
          deleteConcert ? (
            <p>Are you sure you want to delete <strong>&quot;{deleteConcert.title}&quot;</strong>?</p>
          ) : null
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
