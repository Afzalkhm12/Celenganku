import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const spinnerVariants = cva(
  'animate-spin rounded-full border-t-2 border-b-2',
  {
    variants: {
      color: {
        default: 'border-blue-600',
        light: 'border-white',
      },
      size: {
        default: 'h-8 w-8',
        sm: 'h-5 w-5',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'default',
    },
  }
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ className, color, size }) => {
  return (
    <div className={clsx(spinnerVariants({ color, size }), className)} />
  );
};

export { LoadingSpinner };
