import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  createDraftUserListItem,
  User,
  UserInfo,
  UserListItem,
  UserRole,
} from '../../common/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['getUserList'],
  endpoints: (builder) => ({
    getUserList: builder.query<UserListItem[], void>({
      providesTags: ['getUserList'],
      query: () => ({
        url: '/api/user/list',
        method: 'get',
      }),
    }),
    getUser: builder.query<User, number>({
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
    removeUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/api/user/${userId}`,
        method: 'delete',
      }),
      onQueryStarted: async (userId, { dispatch, queryFulfilled }) => {
        await queryFulfilled;
        dispatch(
          api.util.updateQueryData('getUserList', undefined, (list) => {
            return list.filter((x) => x.id !== userId);
          }),
        );
      },
    }),
    addUser: builder.mutation<UserInfo, void>({
      query: () => ({
        url: '/api/user',
        method: 'post',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const response = await queryFulfilled;
        const user = response.data;
        dispatch(
          api.util.updateQueryData('getUserList', undefined, (list) => {
            const draftUser = createDraftUserListItem(user.id, user.name);
            return [...list, draftUser];
          }),
        );
        setTimeout(() => {
          dispatch(api.util.invalidateTags(['getUserList']));
        }, 100);
      },
    }),
  }),
});
