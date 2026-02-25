'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/hooks/queries/useAuth';
import { Icon } from '@/components/ui/Icon';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { loginSchema, type LoginFormData } from '@/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        showSuccessToast('Welcome back!', 'Logged in successfully');
        router.push('/');
      },
      onError: (error) => {
        showErrorToast(error, 'Login failed');
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal flex items-center justify-center">
            <Icon name="confirmation_number" className="text-3xl text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold font-heading text-ink">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Or{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-brutal-static py-8 px-6 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="mail" className="text-ink-light text-sm" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`input-brutal pl-10 ${errors.email ? 'input-brutal-error' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-secondary font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="lock" className="text-ink-light text-sm" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`input-brutal pl-10 ${errors.password ? 'input-brutal-error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-secondary font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <button type="submit" disabled={isPending} className="btn-brutal btn-primary w-full py-3 text-sm">
                {isPending ? (
                  <Icon name="progress_activity" className="animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
