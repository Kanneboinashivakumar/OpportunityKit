import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[var(--color-text)] shadow-[inset_0_1px_2px_rgba(28,36,48,0.025)] transition-[border-color,box-shadow] placeholder:text-[var(--color-text-placeholder)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]/15 focus-visible:border-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
