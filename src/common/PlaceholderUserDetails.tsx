import { CircularProgress, Stack, Typography } from '@mui/material';

const space = '\u00A0';
const placeholderUser = {
  info: {
    id: space.repeat(2),
    name: space.repeat(4),
    type: space.repeat(9),
    email: space,
    phone: space,
  },
  roles: [space.repeat(11), space.repeat(9)],
};

export const PlaceholderUserDetails = () => {
  const { info, roles } = placeholderUser;
  return (
    <Stack gap={2} position='relative'>
      <Stack direction='row' gap={2} alignItems='center'>
        <Typography
          px={2}
          sx={{
            bgcolor: 'text.secondary',
            color: 'info.contrastText',
          }}
        >
          {info.id}
        </Typography>
        <Typography width='100%'>{info.name}</Typography>
        <Typography
          px={2}
          width='fit-content'
          sx={{
            bgcolor: 'text.secondary',
            color: 'info.contrastText',
          }}
        >
          {info.type}
        </Typography>
      </Stack>
      <Stack direction='column' gap={2}>
        <Typography>{info.email}</Typography>
        <Typography>{info.phone}</Typography>
      </Stack>
      <Stack direction='row' gap={2}>
        {roles.map((role) => (
          <Typography
            key={role}
            px={2}
            sx={{
              bgcolor: 'primary.main',
              color: 'background.paper',
            }}
          >
            {role}
          </Typography>
        ))}
      </Stack>
      <CircularProgress
        size='20px'
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-10px',
          marginLeft: '-10px',
        }}
      />
    </Stack>
  );
};
