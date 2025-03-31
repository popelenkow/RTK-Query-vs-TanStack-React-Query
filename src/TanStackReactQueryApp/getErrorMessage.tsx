import { AxiosError } from 'axios';
import { getResponseMessage } from '../common/api';

export const getErrorMessage = (
  error: unknown,
) => (error instanceof AxiosError && error.response?.data) ? getResponseMessage(error.response?.data) : String(error);
