// Component-related type definitions

import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
   'className'?: string;
   'children'?: ReactNode;
   'id'?: string;
   'data-testid'?: string;
}

// Common component variants
export type ComponentVariant =
   | 'default'
   | 'primary'
   | 'secondary'
   | 'destructive'
   | 'outline'
   | 'ghost'
   | 'link';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Form component props
export interface FormFieldProps extends BaseComponentProps {
   label?: string;
   error?: string;
   required?: boolean;
   disabled?: boolean;
}

// Modal/Dialog props
export interface ModalProps extends BaseComponentProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   title?: string;
   description?: string;
}

// Button props
export interface ButtonProps extends BaseComponentProps {
   variant?: ComponentVariant;
   size?: ComponentSize;
   disabled?: boolean;
   loading?: boolean;
   onClick?: () => void;
   type?: 'button' | 'submit' | 'reset';
}

// Input props
export interface InputProps extends FormFieldProps {
   type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
   placeholder?: string;
   value?: string;
   onChange?: (value: string) => void;
}

// Select props
export interface SelectOption {
   value: string;
   label: string;
   disabled?: boolean;
}

export interface SelectProps extends FormFieldProps {
   options: SelectOption[];
   value?: string;
   onChange?: (value: string) => void;
   placeholder?: string;
   searchable?: boolean;
}
