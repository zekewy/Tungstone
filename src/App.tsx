import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { MotionConfig } from 'framer-motion';
import { wagmiConfig } from './config/wagmi';
import { normalizeWalletRejection } from './lib/vaultMath';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DepositPage } from './pages/DepositPage';
import { PositionPage } from './pages/PositionPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { VaultPage } from './pages/VaultPage';

const tungstoneRainbowTheme = lightTheme({
  accentColor: '#C6F432',
  accentColorForeground: '#161F00',
  borderRadius: 'small',
  overlayBlur: 'none',
});

export default function App() {
  const [walletNotice, setWalletNotice] = useState<string | null>(
    () => window.__tungstonePendingWalletNotice ?? null
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            const notice = normalizeWalletRejection(error);
            if (notice) {
              setWalletNotice(notice);
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (window.__tungstonePendingWalletNotice) {
      setWalletNotice(window.__tungstonePendingWalletNotice);
      window.__tungstonePendingWalletNotice = null;
    }

    const onWalletNotice = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) {
        setWalletNotice(detail);
        window.__tungstonePendingWalletNotice = null;
      }
    };

    window.addEventListener('tungstone:wallet-notice', onWalletNotice);
    return () => {
      window.removeEventListener('tungstone:wallet-notice', onWalletNotice);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={tungstoneRainbowTheme} modalSize="compact">
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Layout
                walletNotice={walletNotice}
                onDismissWalletNotice={() => {
                  window.__tungstonePendingWalletNotice = null;
                  setWalletNotice(null);
                }}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/deposit" element={<DepositPage />} />
                  <Route path="/position" element={<PositionPage />} />
                  <Route path="/withdraw" element={<WithdrawPage />} />
                  <Route path="/vault" element={<VaultPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MotionConfig>
  );
}
