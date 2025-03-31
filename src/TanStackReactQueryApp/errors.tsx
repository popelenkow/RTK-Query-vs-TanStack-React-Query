import axios from 'axios';
import { getResponseMessage } from '../common/api';

export const isNotFound = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const getErrorMessage = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data
    ? getResponseMessage(error.response.data)
    : String(error);
