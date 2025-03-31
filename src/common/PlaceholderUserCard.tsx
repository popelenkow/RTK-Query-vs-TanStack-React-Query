import { CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { UserListItem } from './api';

export type PlaceholderUserCardProps = {
  user: UserListItem;
};
export const PlaceholderUserCard: FC<PlaceholderUserCardProps> = (props) => {
  const { user } = props;
  return (
    <Stack
      component={Paper}
      padding={2}
      gap={2}
      position='relative'
      minHeight='116px'
      height='100%'
    >
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
      </Stack>
      <Typography
        px={6.5}
        width='fit-content'
        sx={{
          bgcolor: 'text.secondary',
          color: 'info.contrastText',
        }}
      >
        &nbsp;
      </Typography>
      <CircularProgress
        size='16px'
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-8px',
          marginLeft: '-8px',
        }}
      />
    </Stack>
  );
};
