import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import {
  createDraftUserListItem,
  UserInfo,
  UserListItem,
  UserRole,
} from '../../common/api';
import axios, { AxiosRequestConfig } from 'axios';

export type BaseQueryError = {
  status?: number;
  statusText?: string;
  data?: unknown;
};
type BaseQueryArgs = {
  url?: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
};
const axiosInstance = axios.create({});
const axiosBaseQuery: BaseQueryFn<BaseQueryArgs, unknown, BaseQueryError> = (args) =>
  axiosInstance(args)
    .then((x) => ({
      data: x.data,
      meta: {
        status: x.status,
        statusText: x.statusText,
      },
    }))
    .catch((error: unknown): { error: BaseQueryError } => {
      if (axios.isAxiosError(error)) {
        return {
          error: {
            status: error.response?.status,
            data: error.response?.data,
            statusText: error.response?.statusText,
          },
        };
      }
      return {
        error: {
          data: error,
        },
      };
    });

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['getUserList'],
  endpoints: (builder) => ({
    getUserList: builder.query<UserListItem[], void>({
      providesTags: ['getUserList'],
      query: () => ({
        url: '/api/user/list',
        method: 'get',
      }),
    }),
    removeUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/api/user/${userId}`,
        method: 'delete',
      }),
      onQueryStarted: async (userId, { dispatch, queryFulfilled }) => {
        await queryFulfilled;
        dispatch(
          api.util.updateQueryData('getUserList', undefined, (list) => {
            if (!list) return list;
            return list.filter((x) => x.id !== userId);
          }),
        );
      },
    }),
    addUser: builder.mutation<void, void>({
      query: () => ({
        url: '/api/user',
        method: 'post',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          api.util.updateQueryData('getUserList', undefined, (list) => {
            if (!list) return list;
            return [...list, createDraftUserListItem()];
          }),
        );
        setTimeout(() => {
          dispatch(api.util.invalidateTags(['getUserList']));
        }, 100);
      },
    }),
    getUser: builder.query<{ info: UserInfo; roles: UserRole[] }, number>({
      async queryFn(userId, _queryApi, _extraOptions, fetchBQ) {
        const [info, roles] = await Promise.all([
          fetchBQ({
            url: `/api/user/${userId}`,
            method: 'get',
          }),
          fetchBQ({
            url: `/api/user/${userId}/roles`,
            method: 'get',
          }),
        ]);
        if (info.error) {
          return { error: info.error };
        }
        if (roles.error) {
          return { error: roles.error };
        }
        return {
          data: {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            info: info.data as UserInfo,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            roles: roles.data as UserRole[],
          },
        };
      },
    }),
  }),
});
