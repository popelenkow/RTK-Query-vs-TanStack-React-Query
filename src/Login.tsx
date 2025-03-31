import { Button, Stack } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router';
import { routeLinks } from './routes';

export const Login: FC = () => {
  return (
    <Stack
      width='100%'
      height='100dvh'
      alignItems='center'
      justifyContent='center'
    >
      <Button
        component={Link}
        to={routeLinks.home}
        variant='contained'
        size='large'
      >
        Login
      </Button>
    </Stack>
  );
};
