import { QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';
import { queryClient } from './api/api';
import { UnauthorizedListener } from './api/unauthorized';
import { Users } from './Users';

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
      <UnauthorizedListener />
    </QueryClientProvider>
  );
};
