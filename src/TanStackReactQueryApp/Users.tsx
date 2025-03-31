import HomeIcon from '@mui/icons-material/Home';
import { IconButton, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Link } from 'react-router';
import { CreateUserCard } from '../common/CreateUserCard';
import { QueryError } from '../common/QueryError';
import { QueryPending } from '../common/QueryPending';
import { UsersLayout } from '../common/UsersLayout';
import { routeLinks } from '../routes';
import { addUserApi, getUserListApi } from './api/endpoints';
import { getErrorMessage } from './errors';
import { UserCard } from './UserCard';
import { UserDetails } from './UserDetails';

export const Users: FC = () => {
  const queryClient = useQueryClient();
  const users = useQuery(getUserListApi());
  const add = useMutation(addUserApi(queryClient));
  const [detailsUserId, setDetailsUserId] = useState<number>();

  const renderContent = () => {
    if (users.isError) {
      return <QueryError message={getErrorMessage(users.error)} />;
    }
    if (users.isPending) {
      return <QueryPending />;
    }
    return (
      <UsersLayout>
        {users.data.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onDetails={() => setDetailsUserId(user.id)}
          />
        ))}
        {users.data.length < 10 && (
          <CreateUserCard
            onClick={() => {
              add.mutate();
            }}
            loading={add.isPending}
          />
        )}
      </UsersLayout>
    );
  };

  return (
    <Stack padding={4} gap={2} height='100dvh'>
      <Stack direction='row' gap={2} justifyContent='space-between'>
        <Typography variant='h4'>Users</Typography>
        <IconButton component={Link} to={routeLinks.home} color='primary'>
          <HomeIcon />
        </IconButton>
      </Stack>
      {renderContent()}
      {detailsUserId && (
        <UserDetails
          userId={detailsUserId}
          close={() => setDetailsUserId(undefined)}
        />
      )}
    </Stack>
  );
};
