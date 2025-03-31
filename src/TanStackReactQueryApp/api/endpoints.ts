import {
  DefaultError,
  queryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import axios from 'axios';
import {
  createDraftUserListItem,
  User,
  UserInfo,
  UserListItem,
  UserRole,
} from '../../common/api';
import { queryClient } from './api';

const mutationOptions = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) => options;

export const getUserListApi = () =>
  queryOptions({
    queryKey: ['getUserListApi'],
    queryFn: () =>
      axios.get<UserListItem[]>('/api/user/list').then((x) => x.data),
  });

export const removeUserApi = (userId: number) =>
  mutationOptions({
    mutationKey: ['removeUserApi'],
    mutationFn: () => axios.delete(`/api/user/${userId}`).then((x) => x.data),
    onSuccess: () => {
      queryClient.setQueryData(getUserListApi().queryKey, (list) => {
        if (!list) return list;
        return list.filter((x) => x.id !== userId);
      });
    },
  });

export const addUserApi = () =>
  mutationOptions({
    mutationFn: () => axios.post<UserInfo>('/api/user').then((x) => x.data),
    onSuccess: () => {
      queryClient.setQueryData(getUserListApi().queryKey, (list) => {
        if (!list) return list;
        return [...list, createDraftUserListItem()];
      });
      queryClient.invalidateQueries({ queryKey: getUserListApi().queryKey });
    },
  });

export const getUserApi = (userId: number) =>
  queryOptions({
    queryKey: ['getUserApi', userId],
    queryFn: async (): Promise<User> => {
      const [info, roles] = await Promise.all([
        axios.get<UserInfo>(`/api/user/${userId}`).then((x) => x.data),
        axios.get<UserRole[]>(`/api/user/${userId}/roles`).then((x) => x.data),
      ]);
      return { info, roles };
    },
  });
