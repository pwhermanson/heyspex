import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from './test-utils';

// Common test patterns for components
export const componentTestUtils = {
   // Test component rendering
   testRendering: (Component: React.ComponentType<any>, props = {}) => {
      const { container } = customRender(<Component {...props} />);
      return { container, screen };
   },

   // Test user interactions
   testUserInteraction: async (Component: React.ComponentType<any>, props = {}) => {
      const user = userEvent.setup();
      customRender(<Component {...props} />);
      return { user, screen };
   },

   // Test component with different props
   testWithProps: (Component: React.ComponentType<any>, propSets: any[]) => {
      return propSets.map((props) => {
         const { container } = customRender(<Component {...props} />);
         return { props, container };
      });
   },

   // Test accessibility
   testAccessibility: (Component: React.ComponentType<any>, props = {}) => {
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
   Button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
         {children}
      </button>
   ),

   Input: ({ value, onChange, ...props }: any) => (
      <input value={value} onChange={onChange} {...props} />
   ),

   Select: ({ options, value, onChange, ...props }: any) => (
      <select value={value} onChange={onChange} {...props}>
         {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
               {option.label}
            </option>
         ))}
      </select>
   ),
};
