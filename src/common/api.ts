export type UserListItem = {
  id: number;
  name: string;
  type: 'Admin' | 'Agent' | 'Customer';
  /** Not api property */
  isDraft?: boolean;
};

export const createDraftUserListItem = (id: number, name: string): UserListItem => ({
  id,
  name,
  type: 'Customer',
  isDraft: true,
});

export type UserInfo = {
  id: number;
  name: string;
  type: 'Admin' | 'Agent' | 'Customer';
  email: string;
  phone: string;
};

export type UserRole = string;

export type User = {
  info: UserInfo;
  roles: string[];
};

export const getResponseMessage = (response: unknown): string | undefined =>
  typeof response === 'object' &&
  response &&
  'message' in response &&
  typeof response.message === 'string'
    ? response.message
    : undefined;
