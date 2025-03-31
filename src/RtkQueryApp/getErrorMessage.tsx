import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getResponseMessage } from '../common/api';

export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
) => ('status' in error ? getResponseMessage(error.data) : error.message);
