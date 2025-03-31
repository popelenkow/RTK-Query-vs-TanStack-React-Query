import { getResponseMessage } from '../../common/api';

export class ApiError extends Error {
  status: number;
  response: unknown;

  constructor(message: string, status: number, response: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }

  toString() {
    return this.message;
  }
}

export type CreateRequestOptions = {
  apiBaseUrl?: string;
};

export type RequestOptions = {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  headers?: HeadersInit;
  body?: BodyInit;
};

export const createRequest = (createOptions?: CreateRequestOptions) => {
  const { apiBaseUrl } = createOptions ?? {};

  return async <Result = void>(options: RequestOptions): Promise<Result> => {
    const { method, url: endpoint, headers, body } = options;

    const url = apiBaseUrl ? new URL(endpoint, apiBaseUrl) : endpoint;
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => undefined);
      throw new ApiError(
        getResponseMessage(errorResponse) ?? response.statusText,
        response.status,
        errorResponse,
      );
    }
    const result = await response.json();
    return result;
  };
};
