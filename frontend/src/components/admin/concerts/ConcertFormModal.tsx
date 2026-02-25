'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { FormField, inputStyles } from '@/components/ui/FormField';
import {
  useCreateConcert,
  useUpdateConcert,
  useUploadUrl,
} from '@/hooks/queries/useConcerts';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import {
  concertCreateSchema,
  concertEditSchema,
  type ConcertCreateFormData,
} from '@/lib/schemas';
import type { Concert } from '@/lib/types';
import axios from 'axios';

interface ConcertFormModalProps {
  concert: Concert | null;
  onClose: () => void;
}

export function ConcertFormModal({ concert, onClose }: ConcertFormModalProps) {
  const isEdit = !!concert;
  const createMutation = useCreateConcert();
  const updateMutation = useUpdateConcert();
  const uploadUrlMutation = useUploadUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(concert?.imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ConcertCreateFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEdit ? concertEditSchema : concertCreateSchema) as any,
    defaultValues: concert
      ? {
          title: concert.title,
          description: concert.description,
          artist: concert.artist,
          venue: concert.venue,
          address: concert.address,
          city: concert.city,
          date: concert.date.slice(0, 16),
          status: concert.status,
          ticketTypes: concert.ticketTypes.map((tt) => ({
            name: tt.name,
            price: tt.price,
            totalSeats: tt.totalSeats,
          })),
        }
      : {
          title: '',
          description: '',
          artist: '',
          venue: '',
          address: '',
          city: '',
          date: '',
          status: 'DRAFT' as const,
          ticketTypes: [{ name: 'General Admission', price: 50, totalSeats: 100 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ticketTypes' });

  // ─── Image Upload ───────────────────────────────

  const handleImageUpload = async (concertId: string, file: File) => {
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await uploadUrlMutation.mutateAsync({
        concertId,
        fileType: file.type,
      });
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
      await updateMutation.mutateAsync({ id: concertId, data: { imageUrl: publicUrl } });
      setImagePreview(publicUrl);
      showSuccessToast('Image uploaded successfully');
    } catch (error) {
      showErrorToast(error, 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    if (concert) await handleImageUpload(concert.id, file);
  };

  // ─── Submit ─────────────────────────────────────

  const onSubmit = async (data: ConcertCreateFormData) => {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      ticketTypes: data.ticketTypes?.map((tt) => ({
        ...tt,
        price: Number(tt.price),
        totalSeats: Number(tt.totalSeats),
      })),
    };

    try {
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ticketTypes, ...updateData } = payload;
        await updateMutation.mutateAsync({ id: concert.id, data: updateData });
        showSuccessToast('Concert updated');
      } else {
        const created = await createMutation.mutateAsync(payload);
        const file = fileInputRef.current?.files?.[0];
        if (file) await handleImageUpload(created.id, file);
        showSuccessToast('Concert created');
      }
      onClose();
    } catch (error: unknown) {
      const apiError = error as { errors?: { field: string; message: string }[] };
      if (apiError?.errors?.length) {
        apiError.errors.forEach((err) => {
          setError(err.field as keyof ConcertCreateFormData, { message: err.message });
        });
      } else {
        showErrorToast(error, isEdit ? 'Update failed' : 'Create failed');
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Concert' : 'Create Concert'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Event Image</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors h-48 flex items-center justify-center"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <Icon name="cloud_upload" className="text-4xl mb-1" />
                <p className="text-sm">Click to upload image</p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Icon name="sync" className="text-3xl text-white animate-spin" />
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Title" error={errors.title?.message}>
              <input {...register('title')} className={inputStyles(!!errors.title)} placeholder="Concert Title" />
            </FormField>
          </div>
          <FormField label="Artist" error={errors.artist?.message}>
            <input {...register('artist')} className={inputStyles(!!errors.artist)} placeholder="Artist Name" />
          </FormField>
          <FormField label="City" error={errors.city?.message}>
            <input {...register('city')} className={inputStyles(!!errors.city)} placeholder="City" />
          </FormField>
          <FormField label="Venue" error={errors.venue?.message}>
            <input {...register('venue')} className={inputStyles(!!errors.venue)} placeholder="Venue Name" />
          </FormField>
          <FormField label="Date & Time" error={errors.date?.message}>
            <input type="datetime-local" {...register('date')} className={inputStyles(!!errors.date)} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Address" error={errors.address?.message}>
              <input {...register('address')} className={inputStyles(!!errors.address)} placeholder="Full Address" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={3}
                className={`${inputStyles(!!errors.description)} resize-none`}
                placeholder="Describe the event (min 10 characters)..."
              />
            </FormField>
          </div>
          <FormField label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputStyles(!!errors.status)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </FormField>
        </div>

        {/* Ticket Types */}
        {!isEdit && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticket Types</label>
              <button
                type="button"
                onClick={() => append({ name: '', price: 0, totalSeats: 0 })}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-[var(--color-primary-hover)] font-medium"
              >
                <Icon name="add" className="text-sm" /> Add Type
              </button>
            </div>
            {errors.ticketTypes?.root && (
              <p className="text-xs text-red-500 mt-1">{errors.ticketTypes.root.message}</p>
            )}
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <FormField label="" error={errors.ticketTypes?.[i]?.name?.message}>
                      <input {...register(`ticketTypes.${i}.name`)} placeholder="Name" className={inputStyles(!!errors.ticketTypes?.[i]?.name)} />
                    </FormField>
                    <FormField label="" error={errors.ticketTypes?.[i]?.price?.message}>
                      <input type="number" {...register(`ticketTypes.${i}.price`, { valueAsNumber: true })} placeholder="Price" min={0} className={inputStyles(!!errors.ticketTypes?.[i]?.price)} />
                    </FormField>
                    <FormField label="" error={errors.ticketTypes?.[i]?.totalSeats?.message}>
                      <input type="number" {...register(`ticketTypes.${i}.totalSeats`, { valueAsNumber: true })} placeholder="Seats" min={1} className={inputStyles(!!errors.ticketTypes?.[i]?.totalSeats)} />
                    </FormField>
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 mt-1">
                      <Icon name="delete" className="text-lg" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-border-dark">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="px-5 py-2 bg-primary hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Concert'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
