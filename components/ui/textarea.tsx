import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
   return (
      <textarea
         data-slot="textarea"
         /* Disable Grammarly and similar extensions to reduce DOM mutations before hydration */
         data-gramm="false"
         data-gramm_editor="false"
         data-enable-grammarly="false"
         className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
         )}
         {...props}
      />
   );
}

export { Textarea };
