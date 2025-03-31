import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './Home';
import { Login } from './Login';
import { routePatterns } from './routes';
import { App as RtkQueryApp } from './RtkQueryApp';
import { App as TanstackReactQueryApp } from './TanStackReactQueryApp';

const appTheme = createTheme({
  spacing: 4,
  palette: {
    mode: 'dark',
  },
});

export const App: FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path={routePatterns.redux} element={<RtkQueryApp />} />
          <Route
            path={routePatterns.tanstack}
            element={<TanstackReactQueryApp />}
          />
          <Route path={routePatterns.login} element={<Login />} />
          <Route path={routePatterns.any} element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
