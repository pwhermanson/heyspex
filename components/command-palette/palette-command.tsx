'use client';

import { useCallback, type ComponentProps } from 'react';

import { Command } from '@/components/ui/command';
import { usePaletteStore } from '@/components/command-palette/palette-provider';

type PaletteCommandProps = Omit<ComponentProps<typeof Command>, 'value' | 'onValueChange'> & {
   onQueryChange?: (value: string) => void;
};

export function PaletteCommand({ onQueryChange, ...props }: PaletteCommandProps) {
   const handleValueChange = useCallback(
      (value: string) => {
         console.log('🎯 PaletteCommand received value change:', value);
         onQueryChange?.(value);
      },
      [onQueryChange]
   );

   return <Command onValueChange={handleValueChange} shouldFilter={false} {...props} />;
}
