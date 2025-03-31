import axios from 'axios';
import { getResponseMessage } from '../common/api';

export const getErrorMessage = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data
    ? getResponseMessage(error.response.data)
    : String(error);
