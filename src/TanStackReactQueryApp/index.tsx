import { QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';
import { queryClient } from './api/api';
import { useUnauthorizedListener } from './api/unauthorized';
import { Users } from './Users';

export const App: FC = () => {
  useUnauthorizedListener();

  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
};
