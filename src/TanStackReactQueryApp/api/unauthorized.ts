import { useQueryClient } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { routeLinks } from '../../routes';
import { isUnauthorized } from '../errors';

export const useUnauthorizedListener = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeMutation = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type !== 'updated') return;
        const { state } = event.mutation;
        if (state.status === 'error' && isUnauthorized(state.error)) {
          navigate(routeLinks.login);
        }
      });
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      const { state } = event.query;
      if (state.status === 'error' && isUnauthorized(state.error)) {
        navigate(routeLinks.login);
      }
    });

    return () => {
      unsubscribeMutation();
      unsubscribeQuery();
    };
  }, [navigate, queryClient]);
};

export const UnauthorizedListener: FC = () => {
  useUnauthorizedListener();
  return null;
};
