import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { UserListItem } from '../common/api';
import { PlaceholderUserCard } from '../common/PlaceholderUserCard';
import { removeUserApi } from './api/endpoints';
import { getErrorMessage, isNotFound } from './errors';

const getDeleteErrorMessage = (error: unknown) => {
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

  const queryClient = useQueryClient();
  const [error, setError] = useState<string>();
  const handleError = (x: unknown) => setError(getDeleteErrorMessage(x));
  const remove = useMutation(removeUserApi(queryClient, user.id, handleError));

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
          onClick={() => remove.mutate()}
          loading={remove.isPending}
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
