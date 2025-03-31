import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { FC } from 'react';

export type CreateUserCardProps = {
  onClick?: () => void;
  loading?: boolean;
};
export const CreateUserCard: FC<CreateUserCardProps> = (props) => {
  const { onClick, loading } = props;

  return (
    <Button
      component={Paper}
      sx={{ minHeight: '116px', height: '100%' }}
      onClick={onClick}
      size='large'
      loading={loading}
    >
      <AddIcon fontSize='large' />
    </Button>
  );
};
