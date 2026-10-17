import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-navy)] text-white shadow-sm hover:bg-[var(--color-navy-hover)] hover:shadow-md active:translate-y-px',
        destructive: 'bg-[var(--color-mismatch)] text-white shadow-sm hover:opacity-90 active:translate-y-px',
        outline: 'border border-[var(--color-border-strong)] bg-white text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surface)] hover:border-[var(--color-navy)]',
        secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
        ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]',
        link: 'text-[var(--color-navy)] underline-offset-4 hover:underline',
        sage: 'bg-[var(--color-sage)] text-white shadow-sm hover:opacity-90 active:translate-y-px',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6 text-base',
        xl: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
