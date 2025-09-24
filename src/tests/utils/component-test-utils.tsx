import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from './test-utils';

// Common test patterns for components
export const componentTestUtils = {
   // Test component rendering
   testRendering: (Component: React.ComponentType<Record<string, unknown>>, props = {}) => {
      const { container } = customRender(<Component {...props} />);
      return { container, screen };
   },

   // Test user interactions
   testUserInteraction: async (
      Component: React.ComponentType<Record<string, unknown>>,
      props = {}
   ) => {
      const user = userEvent.setup();
      customRender(<Component {...props} />);
      return { user, screen };
   },

   // Test component with different props
   testWithProps: (
      Component: React.ComponentType<Record<string, unknown>>,
      propSets: Record<string, unknown>[]
   ) => {
      return propSets.map((props) => {
         const { container } = customRender(<Component {...props} />);
         return { props, container };
      });
   },

   // Test accessibility
   testAccessibility: (Component: React.ComponentType<Record<string, unknown>>, props = {}) => {
      const { container } = customRender(<Component {...props} />);

      // Basic accessibility checks
      const elements = {
         buttons: container.querySelectorAll('button'),
         inputs: container.querySelectorAll('input'),
         links: container.querySelectorAll('a'),
         headings: container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      };

      return { container, elements };
   },
};

// Mock components for testing
export const MockComponents = {
   Button: ({
      children,
      onClick,
      ...props
   }: {
      children: React.ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
   }) => (
      <button onClick={onClick} {...props}>
         {children}
      </button>
   ),

   Input: ({
      value,
      onChange,
      ...props
   }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      [key: string]: unknown;
   }) => <input value={value} onChange={onChange} {...props} />,

   Select: ({
      options,
      value,
      onChange,
      ...props
   }: {
      options?: Array<{ value: string; label: string }>;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      [key: string]: unknown;
   }) => (
      <select value={value} onChange={onChange} {...props}>
         {options?.map((option) => (
            <option key={option.value} value={option.value}>
               {option.label}
            </option>
         ))}
      </select>
   ),
};
