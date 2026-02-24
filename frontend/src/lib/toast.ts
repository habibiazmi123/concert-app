import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiError {
  success: boolean;
  statusCode: number;
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Extract a user-friendly error message from an API error.
 * Handles Zod validation errors (field-level), general API errors, and unknown errors.
 */
export function getErrorMessage(error: unknown): string {
  // Handle AxiosError (direct axios calls)
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiError;

    if (data.errors?.length) {
      return data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }

    if (typeof data.message === 'string') {
      return data.message;
    }

    if (Array.isArray(data.message)) {
      return (data.message as string[]).join(', ');
    }
  }

  // Handle plain ApiError object thrown by fetcher.ts handleError()
  if (error && typeof error === 'object' && 'message' in error) {
    const apiErr = error as { message?: string; errors?: Array<{ field: string; message: string }> };

    if (apiErr.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
      return apiErr.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }

    if (typeof apiErr.message === 'string') {
      return apiErr.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Show an error toast with the extracted error message.
 */
export function showErrorToast(error: unknown, title?: string) {
  const message = getErrorMessage(error);

  toast.error(title || 'Error', {
    description: message,
  });
}

/**
 * Show a success toast.
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
  });
}
