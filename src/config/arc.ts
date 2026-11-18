import { defineChain, isAddress, type Address } from 'viem';

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL =
  import.meta.env.VITE_ARC_RPC_URL?.trim() || 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL =
  import.meta.env.VITE_ARC_EXPLORER_URL?.trim() || 'https://testnet.arcscan.app';

export const USDC_ADDRESS: Address = isAddress(
  import.meta.env.VITE_USDC_ADDRESS?.trim() || ''
)
  ? (import.meta.env.VITE_USDC_ADDRESS!.trim() as Address)
  : '0x3600000000000000000000000000000000000000';

export const EURC_ADDRESS: Address = isAddress(
  import.meta.env.VITE_EURC_ADDRESS?.trim() || ''
)
  ? (import.meta.env.VITE_EURC_ADDRESS!.trim() as Address)
  : '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

const rawContract = import.meta.env.VITE_CONTRACT_ADDRESS?.trim() || '';
export const VAULT_CONTRACT_ADDRESS: Address | undefined = isAddress(rawContract)
  ? (rawContract as Address)
  : undefined;

const rawAdmin = import.meta.env.VITE_ADMIN_WALLET?.trim() || '';
export const ADMIN_WALLET_ADDRESS: Address | undefined = isAddress(rawAdmin)
  ? (rawAdmin as Address)
  : undefined;

const rawWcId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || '';
export const WALLETCONNECT_PROJECT_ID: string | undefined =
  rawWcId && !rawWcId.startsWith('[') && rawWcId !== 'MY_WALLETCONNECT_ID'
    ? rawWcId
    : undefined;

export const arcChain = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
    public: {
      http: [ARC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: ARC_EXPLORER_URL,
    },
  },
});

export function explorerTxUrl(hash: string): string {
  return `${ARC_EXPLORER_URL.replace(/\/$/, '')}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${ARC_EXPLORER_URL.replace(/\/$/, '')}/address/${address}`;
}
