import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const runApp = async () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = document.getElementById('root')!;
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const splashScreen = document.getElementById('splashScreen')!;
  splashScreen.style.display = 'none';
};

runApp();
