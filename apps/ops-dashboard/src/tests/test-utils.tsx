import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export function createWrapper(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return (
    <MemoryRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}
