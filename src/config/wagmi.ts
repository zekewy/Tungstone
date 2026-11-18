import { createConfig, http } from 'wagmi';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { arcChain, ARC_RPC_URL, WALLETCONNECT_PROJECT_ID } from './arc';

const walletList = WALLETCONNECT_PROJECT_ID
  ? [injectedWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet]
  : [injectedWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Available Wallets',
      wallets: walletList,
    },
  ],
  {
    appName: 'Tungstone',
    projectId: WALLETCONNECT_PROJECT_ID || 'tungstone-injected-only',
  }
);

export const wagmiConfig = createConfig({
  chains: [arcChain],
  connectors,
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: true,
});
