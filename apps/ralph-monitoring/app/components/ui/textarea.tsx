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
            'px-(--control-padding-x) py-(--control-padding-y)',
            'text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-ring focus-visible:ring-offset-(--focus-ring-offset)',
            'disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)',
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
