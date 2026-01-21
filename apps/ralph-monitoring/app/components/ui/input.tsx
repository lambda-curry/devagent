import * as React from 'react';

import { cn } from '~/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          [
            'flex w-full',
            'h-[var(--control-height-default)]',
            'rounded-lg border border-input bg-background',
            'px-[var(--control-padding-x)] py-[var(--control-padding-y)]',
            'text-sm ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
            'disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]'
          ].join(' '),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
