import {
  DefaultError,
  QueryClient,
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

export const removeUserApi = (
  queryClient: QueryClient,
  userId: number,
  onError: (error: unknown) => void,
) =>
  mutationOptions({
    mutationKey: ['removeUserApi', userId],
    mutationFn: () => axios.delete(`/api/user/${userId}`).then((x) => x.data),
    onError,
    onSuccess: () => {
      queryClient.setQueryData(getUserListApi().queryKey, (list) => {
        if (!list) return list;
        return list.filter((x) => x.id !== userId);
      });
    },
  });

export const addUserApi = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: () => axios.post<UserInfo>('/api/user').then((x) => x.data),
    onSuccess: (user) => {
      const { queryKey } = getUserListApi();
      queryClient.setQueryData(queryKey, (list) => {
        if (!list) return list;
        const draftUser = createDraftUserListItem(user.id, user.name);
        return [...list, draftUser];
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });
