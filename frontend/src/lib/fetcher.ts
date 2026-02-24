import { AxiosError } from 'axios';
import { apiClient } from './api';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: unknown;
}

export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
        errors: error.response?.data?.errors,
      };
      throw apiError;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const poster = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
        errors: error.response?.data?.errors,
      };
      throw apiError;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const putter = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
     if (error instanceof AxiosError) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
        errors: error.response?.data?.errors,
      };
      throw apiError;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const deleter = async <T>(url: string): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url);
      return response.data;
    } catch (error) {
       if (error instanceof AxiosError) {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw apiError;
      }
      throw new Error('An unexpected error occurred');
    }
  };
