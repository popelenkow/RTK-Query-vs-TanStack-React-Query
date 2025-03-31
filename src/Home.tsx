import { Button, Stack } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router';
import { routeLinks } from './routes';

export const Home: FC = () => {
  return (
    <Stack
      width='100%'
      height='100dvh'
      direction='row'
      gap={2}
      justifyContent='center'
      alignItems='center'
    >
      <Button component={Link} to={routeLinks.redux} variant='contained'>
        Redux
      </Button>
      <Button component={Link} to={routeLinks.tanstack} variant='contained'>
        TanStack
      </Button>
    </Stack>
  );
};
