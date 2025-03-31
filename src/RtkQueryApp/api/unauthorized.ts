import { isRejected, Middleware } from '@reduxjs/toolkit';
import { NavigateFunction } from 'react-router';
import { routeLinks } from '../../routes';

export const createMiddleware = (navigate: NavigateFunction): Middleware => {
  const middleware: Middleware = () => (next) => (action) => {
    if (
      isRejected(action) &&
      typeof action.payload === 'object' &&
      action.payload !== null &&
      'status' in action.payload &&
      action.payload.status === 401
    ) {
      navigate(routeLinks.login);
    }
    return next(action);
  };
  return middleware;
};
