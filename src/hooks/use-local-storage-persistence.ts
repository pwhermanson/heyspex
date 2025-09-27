'use client';

import { useCallback, useRef, useMemo } from 'react';

/**
 * Custom hook for debounced localStorage persistence
 * Extracted from WorkspaceZoneAProvider to follow Single Responsibility Principle
 */
export function useLocalStoragePersistence() {
   const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   /**
    * Save data to localStorage with debouncing to prevent excessive writes
    * @param key - localStorage key
    * @param data - data to save
    * @param delay - debounce delay in milliseconds (default: 500ms)
    */
   const saveToLocalStorage = useCallback((key: string, data: unknown, delay: number = 500) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
         clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
         try {
            localStorage.setItem(key, JSON.stringify(data));
         } catch (error) {
            console.warn(`Failed to save to localStorage key "${key}":`, error);
         }
      }, delay);
   }, []);

   /**
    * Load data from localStorage with error handling
    * @param key - localStorage key
    * @param defaultValue - default value if key doesn't exist or parsing fails
    */
   const loadFromLocalStorage = useCallback(<T>(key: string, defaultValue: T): T => {
      try {
         const item = localStorage.getItem(key);
         if (item === null) {
            return defaultValue;
         }
         return JSON.parse(item);
      } catch (error) {
         console.warn(`Failed to load from localStorage key "${key}":`, error);
         return defaultValue;
      }
   }, []);

   /**
    * Clear a specific localStorage key
    * @param key - localStorage key to clear
    */
   const clearLocalStorage = useCallback((key: string) => {
      try {
         localStorage.removeItem(key);
      } catch (error) {
         console.warn(`Failed to clear localStorage key "${key}":`, error);
      }
   }, []);

   /**
    * Clean up any pending timeouts
    */
   const cleanup = useCallback(() => {
      if (saveTimeoutRef.current) {
         clearTimeout(saveTimeoutRef.current);
         saveTimeoutRef.current = null;
      }
   }, []);

   // Return a stable object reference to prevent dependency array changes
   return useMemo(
      () => ({
         saveToLocalStorage,
         loadFromLocalStorage,
         clearLocalStorage,
         cleanup,
      }),
      [saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, cleanup]
   );
}
