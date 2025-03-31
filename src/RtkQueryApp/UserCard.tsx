import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Button, IconButton, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { FC, useEffect, useState } from 'react';
import { UserListItem } from '../common/api';
import { PlaceholderUserCard } from '../common/PlaceholderUserCard';
import { api } from './api/endpoints';
import { getErrorMessage, isNotFound } from './errors';

const getDeleteErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
) => {
  if (isNotFound(error)) {
    return 'User not found';
  }
  return getErrorMessage(error);
};

export type UserCardProps = {
  user: UserListItem;
  onDetails?: () => void;
};
export const UserCard: FC<UserCardProps> = (props) => {
  const { user, onDetails } = props;

  const [error, setError] = useState<string>();
  const [remove, removeResult] = api.useRemoveUserMutation();
  useEffect(() => {
    if (!removeResult.isError) return;
    setError(getDeleteErrorMessage(removeResult.error));
  }, [removeResult.isError, removeResult.error]);

  if (user.isDraft) {
    return <PlaceholderUserCard user={user} />;
  }

  return (
    <Stack component={Paper} padding={2} gap={2}>
      <Stack direction='row' gap={2} alignItems='center'>
        <Typography
          px={2}
          sx={{
            bgcolor: 'text.secondary',
            color: 'info.contrastText',
          }}
        >
          {user.id}
        </Typography>
        <Typography width='100%'>{user.name}</Typography>
        <IconButton
          color='primary'
          size='small'
          onClick={() => remove(user.id)}
          loading={removeResult.isLoading}
          sx={{ padding: '1px' }}
        >
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      </Stack>
      <Typography
        px={2}
        width='fit-content'
        sx={{
          bgcolor: 'text.secondary',
          color: 'info.contrastText',
        }}
      >
        {user.type}
      </Typography>
      <Button onClick={onDetails}>Details</Button>
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(undefined)}
      >
        <Alert
          severity='error'
          variant='filled'
          onClose={() => setError(undefined)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
