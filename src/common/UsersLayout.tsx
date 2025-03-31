import { Box } from '@mui/material';
import { FC, PropsWithChildren } from 'react';

export const UsersLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '1fr 1fr 1fr 1fr',
          lg: '1fr 1fr 1fr 1fr 1fr',
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
};
