import { FC, useMemo } from 'react';
import { Provider } from 'react-redux';
import { useNavigate } from 'react-router';
import { createApiStore } from './api/api';
import { Users } from './Users';

export const App: FC = () => {
  const navigate = useNavigate();
  const apiStore = useMemo(() => createApiStore(navigate), [navigate]);
  return (
    <Provider store={apiStore}>
      <Users />
    </Provider>
  );
};
