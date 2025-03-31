import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getResponseMessage } from '../common/api';

export const isNotFound = (error: FetchBaseQueryError | SerializedError) =>
  'status' in error && error.status === 404;

export const isUnauthorized = (error: FetchBaseQueryError | SerializedError) =>
  'status' in error && error.status === 401;

export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
) => ('status' in error ? getResponseMessage(error.data) : error.message);
