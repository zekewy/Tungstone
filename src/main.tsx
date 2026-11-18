import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { normalizeWalletRejection } from './lib/vaultMath';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __tungstonePendingWalletNotice?: string | null;
  }
}

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const notice = normalizeWalletRejection(event.reason);
  if (notice) {
    event.preventDefault();
    window.__tungstonePendingWalletNotice = notice;
    window.dispatchEvent(
      new CustomEvent('tungstone:wallet-notice', { detail: notice })
    );
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
