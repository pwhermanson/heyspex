import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Mock theme provider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
   <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
   </ThemeProvider>
);

// Custom render function that includes providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
   render(ui, { wrapper: MockThemeProvider, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
