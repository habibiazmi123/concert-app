import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  fill?: boolean;
}

export function Icon({ name, fill = false, className, ...props }: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined',
        fill && '![font-variation-settings:"FILL"_1]',
        className
      )}
      {...props}
    >
      {name}
    </span>
  );
}
