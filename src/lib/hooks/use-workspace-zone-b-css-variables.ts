import { useEffect } from 'react';
import type { WorkspaceZoneBMode } from '@/src/components/layout/workspace-zone-b-provider';

interface UseWorkspaceZoneBCSSVariablesProps {
   isEnabled: boolean;
   mode: WorkspaceZoneBMode;
   isVisible: boolean;
   height: number;
}

/**
 * Custom hook to manage CSS variables for Workspace Zone B
 * This ensures the --workspace-zone-b-height CSS variable is properly updated
 * based on the workspace zone B state, preventing push mode collapse issues.
 */
export function useWorkspaceZoneBCSSVariables({
   isEnabled,
   mode,
   isVisible,
   height,
}: UseWorkspaceZoneBCSSVariablesProps) {
   useEffect(() => {
      const shouldUpdateHeight = isEnabled && mode === 'push' && isVisible;
      const effectiveHeight = shouldUpdateHeight ? Math.max(40, height) : 40;

      // Update the CSS variable
      document.documentElement.style.setProperty(
         '--workspace-zone-b-height',
         `${effectiveHeight}px`
      );

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
         console.log('🔧 Workspace Zone B CSS Variables:', {
            isEnabled,
            mode,
            isVisible,
            height,
            effectiveHeight,
            shouldUpdateHeight,
         });
      }

      // Cleanup function to reset CSS variable when component unmounts
      return () => {
         document.documentElement.style.setProperty('--workspace-zone-b-height', '40px');
      };
   }, [isEnabled, mode, isVisible, height]);
}
