export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-ink mb-1">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-secondary font-medium mt-1">{error}</p>}
    </div>
  );
}

export const inputStyles = (hasError = false) =>
  `input-brutal ${hasError ? 'input-brutal-error' : ''}`;
