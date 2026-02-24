import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          success: true as const,
          data: (data?.data !== undefined ? data.data : data) as T,
          message: data?.message || 'Success',
          timestamp: new Date().toISOString(),
        } as ApiResponse<T>;

        if (data?.meta !== undefined) {
          response.meta = data.meta;
        }

        return response;
      }),
    );
  }
}
