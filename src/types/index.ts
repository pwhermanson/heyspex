// Centralized type definitions for HeySpex
// This file serves as the main entry point for all shared types

// Re-export all types from feature-specific type files
export * from './api';
export * from './components';
export * from './features';
export * from './state';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common ID types
export type ID = string | number;
export type UUID = string;
export type Timestamp = number;

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
