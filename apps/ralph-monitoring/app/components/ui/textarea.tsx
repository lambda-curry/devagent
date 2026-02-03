import * as React from 'react';

import { cn } from '~/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          [
            'flex w-full min-h-[80px]',
            'rounded-lg border border-input bg-background',
            'px-[var(--control-padding-x)] py-[var(--control-padding-y)]',
            'text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
            'disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]',
            'resize-vertical',
          ].join(' '),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
