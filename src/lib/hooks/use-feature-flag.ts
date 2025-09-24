'use client';

import { useEffect, useState } from 'react';
import {
   FEATURE_FLAG_EVENT,
   FeatureFlagName,
   getFeatureFlag,
   getFeatureFlagStorageKey,
} from '@/src/lib/lib/feature-flags';

export function useFeatureFlag(flag: FeatureFlagName) {
   const [isEnabled, setIsEnabled] = useState(() => getFeatureFlag(flag));

   useEffect(() => {
      if (typeof window === 'undefined') {
         return;
      }

      const syncFlag = () => {
         setIsEnabled(getFeatureFlag(flag));
      };

      syncFlag();

      const handleStorage = (event: StorageEvent) => {
         if (event.key === getFeatureFlagStorageKey(flag)) {
            syncFlag();
         }
      };

      const handleCustomEvent = (event: Event) => {
         const detail = (event as CustomEvent<{ flag: FeatureFlagName }>).detail;
         if (detail?.flag === flag) {
            syncFlag();
         }
      };

      window.addEventListener('storage', handleStorage);
      window.addEventListener(FEATURE_FLAG_EVENT, handleCustomEvent as EventListener);

      return () => {
         window.removeEventListener('storage', handleStorage);
         window.removeEventListener(FEATURE_FLAG_EVENT, handleCustomEvent as EventListener);
      };
   }, [flag]);

   return isEnabled;
}
