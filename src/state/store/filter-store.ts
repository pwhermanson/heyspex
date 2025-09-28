import { create } from 'zustand';
import { FilterUtils, type FilterOptions } from '@/src/lib/lib/filter-utils';

export interface FilterState {
   // Filter options
   filters: FilterOptions;

   // Actions
   setFilter: (type: keyof FilterOptions, ids: string[]) => void;
   toggleFilter: (type: keyof FilterOptions, id: string) => void;
   clearFilters: () => void;
   clearFilterType: (type: keyof FilterOptions) => void;

   // Utility
   hasActiveFilters: () => boolean;
   getActiveFiltersCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
   // Initial state
   filters: {},

   // Actions
   setFilter: (type, ids) => {
      set((state) => {
         const newFilters = {
            ...state.filters,
            [type]: ids,
         };
         return { filters: newFilters };
      });
   },

   toggleFilter: (type, id) => {
      set((state) => {
         const currentFilters = state.filters[type] || [];
         const newFilters = currentFilters.includes(id)
            ? currentFilters.filter((item) => item !== id)
            : [...currentFilters, id];

         return {
            filters: {
               ...state.filters,
               [type]: newFilters,
            },
         };
      });
   },

   clearFilters: () => {
      set({ filters: {} });
   },

   clearFilterType: (type) => {
      set((state) => ({
         filters: {
            ...state.filters,
            [type]: [],
         },
      }));
   },

   // Utility
   hasActiveFilters: () => {
      const { filters } = get();
      return FilterUtils.hasActiveFilters(filters);
   },

   getActiveFiltersCount: () => {
      const { filters } = get();
      return FilterUtils.getActiveFiltersCount(filters);
   },
}));
