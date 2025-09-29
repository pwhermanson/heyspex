/**
 * Instruction Text Component
 *
 * Displays user instructions with consistent styling and responsive design.
 * Extracted from main component to follow single use principle.
 *
 * @file instruction-text.tsx
 * @author App Shell Branded System
 * @version 1.0.0
 */

import React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { COMPONENT_STYLES } from '../style-generators';

/**
 * Props interface for InstructionText component
 */
export interface InstructionTextProps {
   /** Optional additional CSS classes */
   className?: string;
   /** Optional custom instruction text */
   text?: string;
}

/**
 * InstructionText Component
 *
 * Renders user instructions with keyboard shortcuts in a consistent format.
 * Uses the centralized styling system for consistent appearance.
 *
 * @param props - Component props
 * @returns JSX element containing instruction text
 */
export const InstructionText: React.FC<InstructionTextProps> = ({
   className = '',
   text = 'Press Ctrl + / to get started',
}) => {
   return (
      <div className={cn('text-center relative z-10', className)} data-testid="instruction-text">
         <p className="text-lg text-muted-foreground">
            {text.includes('Ctrl') ? (
               <>
                  Press <kbd className={COMPONENT_STYLES.kbdButton}>Ctrl</kbd> +{' '}
                  <kbd className={COMPONENT_STYLES.kbdButton}>/</kbd> to get started
               </>
            ) : (
               text
            )}
         </p>
      </div>
   );
};

InstructionText.displayName = 'InstructionText';
