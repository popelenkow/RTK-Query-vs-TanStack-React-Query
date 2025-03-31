import { configureStore } from '@reduxjs/toolkit';
import { NavigateFunction } from 'react-router';
import { api } from './endpoints';
import { createMiddleware } from './unauthorized';

const reducer = {
  [api.reducerPath]: api.reducer,
};

export const createApiStore = (navigate: NavigateFunction) =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, createMiddleware(navigate)),
  });
