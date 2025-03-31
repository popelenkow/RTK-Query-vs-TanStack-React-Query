import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { UserListItem } from '../common/api';
import { PlaceholderUserCard } from '../common/PlaceholderUserCard';
import { removeUserApi } from './api/endpoints';

export type UserCardProps = {
  user: UserListItem;
  onDetails?: () => void;
};
export const UserCard: FC<UserCardProps> = (props) => {
  const { user, onDetails } = props;
  const remove = useMutation(removeUserApi(user.id));

  if (user.isDraft) {
    return <PlaceholderUserCard />
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
          sx={{ padding: '3px' }}
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
    </Stack>
  );
};
