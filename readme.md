# Redux RTK Query vs TanStack React Query

Compares solutions to common data-fetching tasks

## Table of Contents

- [Versions](#versions)
- [Project Structure](#project-structure)
- [Comparison Points](#comparison-points)
  - [1. Startup infrastructure](#1-startup-infrastructure)
  - [2. useQuery code navigation](#2-usequery-code-navigation)
  - [3. useQuery return type](#3-usequery-return-type)
  - [4. useQuery status hole](#4-usequery-status-hole)
  - [5. Data fetch](#5-data-fetch)
  - [6. Query error handling](#6-query-error-handling)
  - [7. Query status code](#7-query-status-code)
  - [8. Endpoints implementation](#8-endpoints-implementation)
  - [9. Query combine](#9-query-combine)
  - [10. Logout listener](#10-logout-listener)
  - [11. Mutation](#11-mutation)
  - [12. Query invalidation](#12-query-invalidation)
  - [13. Middleware](#13-middleware)
- [Project Purpose](#project-purpose)
- [License](#license)

## Versions

- @reduxjs/toolkit=2.6.x
- @tanstack/react-query=5.67.x

## Project Structure

- **src/RtkQueryApp/** – application using Redux RTK Query
- **src/TanstackReactQueryApp/** – application using TanStack React Query
- **src/{TargetApp}/api/api** – service implementing asynchronous state manager
- **src/{TargetApp}/api/endpoints** – all application endpoints
- **src/{TargetApp}/api/unauthorized** – authorization error listener, redirect to login page
- **src/{TargetApp}/index** – setting up app Provider
- **src/{TargetApp}/users** – main content page

## Comparison Points

### 1. Startup infrastructure

Setting up state management, provider, and using request hooks do not have significant differences.

**Redux** requires implementing a `reducer`, `middleware`, `store`, `Provider`:

```tsx
// Redux
const reducer = {
  [api.reducerPath]: api.reducer,
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

const App = () => {
  return (
    <Provider store={store}>
      <Users />
    </Provider>
  );
};
```

**TanStack** requires implementing a `queryClient`, and `Provider`:

```tsx
// TanStack
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
};
```

It is worth noting that **Redux** requires the connection of all reducers and middleware in the creation of a store, which is an god object anti-pattern. **TanStack** does not impose these restrictions; instead, interaction via its state management is more semantically localized and less tightly coupled.

### 2. `useQuery` code navigation

Call hook `useQuery`:

```tsx
// Redux
const users = api.useGetUserListQuery();
// TanStack
const users = useQuery(getUserListApi());
```

Navigation **Go to implementation** doesn't work for **Redux** `useGetUserListQuery` while for **TanStack** `getUserListApi` it works. Because **Redux** code generates hook name from original user field name: `getUserList` -> `useGetUserListQuery`. Navigation to `api` loses specificity and does not allow to find query implementation with one click. Finding query implementation by search is complicated, original query name `getUserList` does not have the prefix `use`, suffix `Query` and not CapitalCase.

Complex code generation increases user cognitive load. There is no reason for such code generation, there are many solutions without generating hook query name with good code navigation.

P.S. [RTK Query overview page](https://redux-toolkit.js.org/rtk-query/overview#create-an-api-slice) suggest exporting hooks inside a file with `createApi`. Exporting hooks does not solve navigation problem inside file, it is identical **Go to implementation** `api`. Also exporting hooks is code duplication.

### 3. `useQuery` return type

Demonstration of type inference in all cases:

```tsx
// Redux
export const Users: FC = () => {
  const users = api.useGetUserListQuery();
  // const users: UseQueryHookResult<QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, "getUserList", UserListItem[], "api">, UseQueryStateDefaultResult<...>>
  if (users.isError) {
    // const users: {
    //   data?: UserListItem[] | undefined;
    //   fulfilledTimeStamp?: number | undefined;
    //   originalArgs?: void | undefined;
    //   requestId?: string | undefined;
    //   endpointName?: string | undefined;
    //   ... 8 more ...;
    //   error: FetchBaseQueryError | SerializedError;
    // } & {
    //   ...;
    return null;
  }
  if (users.isUninitialized) {
    // const users: {
    //   error?: undefined | undefined;
    //   data?: undefined | undefined;
    //   fulfilledTimeStamp?: undefined | undefined;
    //   originalArgs?: undefined | undefined;
    //   requestId?: undefined | undefined;
    //   endpointName?: string | undefined;
    //   startedTimeStamp?: undefined | undefined;
    //   status: QueryStatus.uninitialized;
    //   ... 5 more ...;
    //   isUninitialized: true;
    // } & {
    //   ...;
    return null;
  }
  if (users.isLoading) {
    // const users: {
    //   error?: FetchBaseQueryError | SerializedError | undefined;
    //   fulfilledTimeStamp?: number | undefined;
    //   originalArgs?: void | undefined;
    //   ... 10 more ...;
    //   data: undefined;
    // } & {
    //   ...;
    // } & UseQuerySubscriptionResult<...>
    return null;
  }
  if (users.isSuccess) {
    // const users: ({
    //   originalArgs?: void | undefined;
    //   requestId?: string | undefined;
    //   endpointName?: string | undefined;
    //   startedTimeStamp?: number | undefined;
    //   status: QueryStatus;
    //   currentData?: UserListItem[] | undefined;
    //   ... 7 more ...;
    //   fulfilledTimeStamp: number;
    // } & {
    //     ...;
    // } & UseQuerySubscriptionResult<...>) | ({
    //     ...;
    // } & ... 1 more ... & UseQuerySubscriptionResult<...>)
    return null;
  }
  // const users: never
  return null;
};
```

```tsx
// TanStack
export const Users: FC = () => {
  const users = useQuery(getUserListApi());
  // const users: UseQueryResult<UserListItem[], Error>
  if (users.isError) {
    // const users: QueryObserverRefetchErrorResult<UserListItem[], Error> | QueryObserverLoadingErrorResult<UserListItem[], Error>
    return null;
  }
  if (users.isPending) {
    // const users: QueryObserverLoadingResult<UserListItem[], Error> | QueryObserverPendingResult<UserListItem[], Error>
    return null;
  }
  if (users.isSuccess) {
    // const users: QueryObserverSuccessResult<UserListItem[], Error> | QueryObserverPlaceholderResult<UserListItem[], Error>
    return null;
  }
  // const users: never
  return null;
};
```

Type inference works. If exclude all status flags, then will get `never` in both cases.

But it is worth noting that types in **Redux** are impossible to understand, refer to the definition file and match with the documentation. In **Redux** there are no explicit contracts without endless generics and detailing. The main problem is that you cannot write a function that will accept the result of the "use query" hook as input, as you can do in **TanStack**: `(users: UseQueryResult<UserListItem[], Error>) => { ... }`. This reduces the user's capabilities of the library. This makes **RTK Query** future unclear. In **TanStack** all these contracts are simple, open the definition file and see for yourself.

### 4. `useQuery` status hole

It seems that the statuses are interchangeable and both expressions are true.

```ts
// Redux
const { isSuccess, isError, isUninitialized, isLoading } =
  api.useGetUserListQuery();
isSuccess === !(isError || isUninitialized || isLoading);
// TanStack
const { isSuccess, isError, isPending } = useQuery(getUserListApi());
isSuccess === !(isError || isPending);
```

Run website, open **Not found** user details, close popup and open again: error during rendering and the whole layout is destroyed. Console log: `UserDetails.tsx:33 Uncaught TypeError: Cannot destructure property 'info' of '(intermediate value)(intermediate value)(intermediate value)' as it is undefined`. Only **Redux** returned this error.

User details code comparison:

```diff
// Redux -> TanStack
export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
- const user = api.useGetUserQuery(userId);
+ const user = useQuery(getUserApi(userId));

  if (user.isError) {
    return <QueryError />;
  }
- if (user.isLoading || user.isUninitialized) {
+ if (user.isPending) {
    return <PlaceholderUserDetails />;
  }
  const { info, roles } = user.data;
  ...
};
```

**Redux** types claim that the `data` exists, and the type check passes without errors, but `data` does not exist, runtime react rendering crashes with an error.

The initial assumption that **Redux** statuses are interchangeable is false, and **TanStack** is true. This makes goal functionality of **RTK Query** unpredictable.

It is recommended to independently determine the reason for this behavior. The available documentation provides sufficient information:

**Redux**

- `isError` - When true, indicates that the query is in an error state
- `isUninitialized` - When true, indicates that the query has not started yet.
- `isLoading` - When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.s
- `isSuccess` - When true, indicates that the query has data from a successful request.

**TanStack**

- `isError` or `status === 'error'` - The query encountered an error
- `isPending` or `status === 'pending'` - The query has no data yet
- `isSuccess` or `status === 'success'` - The query was successful and data is available

Short answer: Use `if (!user.isSuccess) { ... }` condition for pending in **Redux**.

### 5. Data fetch

Let's implement one endpoint

```ts
// Redux
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getUserList: builder.query<UserListItem[], void>({
      query: () => ({
        url: '/api/user/list',
        method: 'get',
      }),
    }),
  }),
});
```

```ts
// TanStack
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export const getUserListApi = () =>
  queryOptions({
    queryKey: ['getUserListApi'],
    queryFn: () =>
      axios.get<UserListItem[]>('/api/user/list').then((x) => x.data),
  });
```

**Redux** provides data fetching out of the box by `fetchBaseQuery`. **TanStack** requires implementing data fetching and the snippet used a third-party library `axios`. The implementation of data fetching from the original `Fetch API` requires quite a bit of code to be usable.

If a custom implementation of `baseQuery` in **Redux** is required, then an example:

```ts
// Redux
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
  baseQuery: axiosBaseQuery,
  ...
});
```

**Redux** provides a simple solution for the typical data fetching task. **Redux** is a data-fetching agnostic, but it is difficult implement custom `baseQuery`, the documentation is [complex and does not demonstrate types](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#implementing-a-custom-basequery).

**TanStack** is a data-fetching agnostic library that allows returning data result and errors natively. **TanStack** does not provide infrastructure metadata such as status code and infrastructure metadata will have to be passed through the payload data result.

### 6. Query error handling

Let's assume that it is necessary to display the original error message from the backend. The message will be in response json:

```ts
export const getResponseMessage = (response: unknown): string | undefined =>
  typeof response === 'object' &&
  response &&
  'message' in response &&
  typeof response.message === 'string'
    ? response.message
    : undefined;
```

Display query error message:

```tsx
// Redux
const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
) => ('status' in error ? getResponseMessage(error.data) : error.message);

export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
  const user = api.useGetUserQuery(userId);

  if (user.isError) {
    return <QueryError message={getErrorMessage(user.error)} />;
  }
  ...
};
```

```tsx
// TanStack
const getErrorMessage = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data
    ? getResponseMessage(error.response.data)
    : String(error);

export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
  const user = useQuery(getUserApi(userId));

  if (user.isError) {
    return <QueryError message={getErrorMessage(user.error)} />;
  }
  ...
};
```

It is possible to check this code by opening **Server Error** user details and observing the message **Unable to access the database**.

**Redux** error is the return value in `baseQuery`. Error type is `FetchBaseQueryError | SerializedError` on common implementation with `fetchBaseQuery`. To extract the data response, the type must be narrowed to `FetchBaseQueryError`. [There's no well-designed approach](https://github.com/reduxjs/redux-toolkit/issues/1337). Therefore, it can be done by checking for the existence of `status` field.

**TanStack** error is a native exception that was caught. Error type is `Error`. To extract the data response, the type must be narrowed to `AxiosError` by `axios.isAxiosError`.

### 7. Query status code

Open **Not found** user details and ensure that the message **Not found** is displayed. Code snippet:

```diff
// Redux -> TanStack
export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
- const user = api.useGetUserQuery(userId);
+ const user = useQuery(getUserApi(userId));

  if (user.isError) {
-   if ('status' in user.error && user.error.status === 404) {
+   if (axios.isAxiosError(user.error) && user.error.status === 404) {
      return <QueryNotFound />;
    }
    ...
  }
  ...
};
```

No difference in getting status code in the error, but...

Open **Not Found Html** user details. **Tanstack** will display **Not found**, but **Redux** will display **Unexpected error**. When the server response is not in JSON format (e.g., an HTML page) and using `fetchBaseQuery` in **Redux**, then parsing will fail. In such cases, the `status` field will have the value `PARSING_ERROR` instead of `404`. The status code will be located here `originalStatus` see [documentation](https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery#signature). Let's fix **Redux** code:

```tsx
if (
  'status' in user.error &&
  (user.error.status === 404 ||
    (user.error.status === 'PARSING_ERROR' &&
      user.error.originalStatus === 404))
) {
  return <QueryNotFound />;
}
```

A simple task has a complex code in **Redux**. Possible solutions include extracting the status code with a helper function, rewrite `fetchBaseQuery` to custom `baseQuery`, or ensuring the backend always returns JSON—even on errors. Although it's ideal for the backend to return JSON, but in real-world it might return non-JSON responses. The issue lies in how Redux conflates error type and status code into a single `status` field. When both can’t fit, the status code is moved to `originalStatus`. A clearer design would separate these into distinct fields.

The status code for a successful query has no practical use, so let's skip it.

### 8. Endpoints implementation

**Redux** requires to set `baseQuery` by `fetchBaseQuery()` that used by each endpoint and implement all `endpoints` in time `createApi`.

```ts
// Redux
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getUserList: builder.query<UserListItem[], void>({
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
    }),
  }),
});
```

**TanStack** requires to implement `queryFn` or `mutationFn` to create one endpoint.

```ts
// TanStack
import {
  DefaultError,
  queryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { createRequest } from './request';

const request = createRequest();

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
      request<UserListItem[]>({
        url: '/api/user/list',
        method: 'get',
      }),
  });

export const removeUserApi = (userId: number) =>
  mutationOptions({
    mutationFn: () =>
      request({
        url: `/api/user/${userId}`,
        method: 'delete',
      }),
  });
```

**Redux** allows to implement many `api` by `createApi`. This allows to create a unique `baseQuery` for each `api` and allows to decompose all endpoints code. The code is unambiguous and predictable for implementation. But the generics `<QueryResult, QueryArgument>` are slightly confusing due to the non-intuitiveness implementation of query function in `builder.query<UserListItem[], void>({ ... })`. Implementing everything in `createApi` don't allow create intermediate functions and types between endpoints.

**Tanstack** allows each endpoint to be implemented independently, which gives greater flexibility. This approach does not lose the ability to interact between endpoints, this will be described in the following points. **TanStack** does not provide a ready-to-use solution for data query. It is necessary to implement a query, this will be described in the following points.

**TanStack** does not provide `mutationOptions` to respect types for using hook `useMutation`. The author of the library claims that it is [useless to share mutation options](https://github.com/TanStack/query/discussions/6096). Implementing query options in an isolated place and implementing mutation options inline in the react rendering place is inconsistent. Mutation inline code in the rendering is a leaky abstraction. Therefore, the custom code is demonstrated in code snippet. Adding such a function to **TanStack** library keeps it optional for use, does not affect the already written code.

### 9. Query combine

It’s common that rendering a page requires two separate GET requests. The best approach is to create a single GET endpoint on the backend that returns all the necessary data for the page. However, in real-world scenarios, this isn’t always feasible — and in such cases, the problem has to be solved on the frontend. Let’s take a look at the difference between using two `useQuery` hooks versus a combined `useQuery`.

```diff
// Redux
// 2 useQuery -> combined useQuery
export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
- const userInfo = api.useGetUserInfoQuery(userId);
- const userRoles = api.useGetUserRolesQuery(userId);
+ const user = api.useGetUserQuery(userId);

- if (userInfo.isError || userRoles.isError) {
+ if (user.isError) {
    if (
-     userInfo.isError
-       ? getErrorStatusCode(userInfo.error) === 404
-       : getErrorStatusCode(userRoles.error) === 404
+     'status' in user.error && user.error.status === 404
    ) {
      return <QueryNotFound />;
    }
    return (
      <QueryError
        message={getErrorMessage(
-         userInfo.isError ? userInfo.error : userRoles.error,
+         user.error
        )}
      />
    );
  }
- if (!userInfo.isSuccess || !userRoles.isSuccess) {
+ if (!user.isSuccess) {
    return <PlaceholderUserDetails />;
  }
- const { info, roles } = { info: userInfo.data, roles: userRoles.data };
+ const { info, roles } = user.data;
  ...
}
```

```diff
// TanStack
// 2 useQuery -> combined useQuery
export const UserDetails: FC<UserDetailsProps> = (props) => {
  const { userId } = props;
- const userInfo = useQuery(getUserInfoApi(userId));
- const userRoles = useQuery(getUserRolesApi(userId));
+ const user = useQuery(getUserApi(userId));

- if (userInfo.isError || userRoles.isError) {
+ if (user.isError) {
    if (
-     userInfo.isError
-       ? axios.isAxiosError(userInfo.error) && userInfo.error.status === 404
-       : axios.isAxiosError(userRoles.error) && userRoles.error.status === 404
+     axios.isAxiosError(user.error) && user.error.status === 404
    ) {
      return <QueryNotFound />;
    }
    return (
      <QueryError
        message={getErrorMessage(
-         userInfo.isError ? userInfo.error : userRoles.error,
+         user.error
        )}
      />
    );
  }
- if (userInfo.isPending || userRoles.isPending) {
+ if (user.isPending) {
    return <PlaceholderUserDetails />;
  }
- const { info, roles } = { info: userInfo.data, roles: userRoles.data };
+ const { info, roles } = user.data;
  ...
}
```

It’s clear that a single useQuery is simpler. With two useQuery hooks, things become more complex — errors and loading states must be handled separately. Is it possible to combine both requests into one useQuery? Let’s see how to implement it:

```tsx
// Redux
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
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
  }),
});
```

```tsx
// TanStack
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
```

Both libraries support this approach, which is a significant advantage. In this code snippet, errors are not combined — while that may be technically inaccurate, combining them can often be excessive. This should be seen not as the ideal solution, but as an elegant compromise. The best solution is to improve the API or UI design.

**Redux** results in slightly more verbose code. Both responses must be awaited, the error selected, and the successful data cast to the correct type.

**TanStack** handles this in a concise and clear way. The first error is returned immediately as the final error, without waiting for the second response.

### 10. Logout listener

### 11. Mutation

### 12. Query invalidation

### 13. Middleware

## Project Purpose

The essence of the project is to demonstrate comparisons of two libraries solving the same problems. The problems should be typical for the implementation of web applications. Discuss and clarify topics, add new points or improve and expand existing points. This way we can get a relevant overview for choosing a library.

## License

This project is licensed under the [MIT License](./license.md).
