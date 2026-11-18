import type { Address } from 'viem';

export type WalletTxAction = 'Approve USDC' | 'Deposit' | 'Withdraw' | 'Withdraw All';
export type WalletTxStatus = 'confirming' | 'confirmed' | 'failed';

export interface WalletTxRecord {
  hash: `0x${string}`;
  action: WalletTxAction;
  amountFormatted: string;
  timestamp: number;
  status: WalletTxStatus;
}

function storageKey(
  chainId: number,
  contractAddress: Address | undefined,
  walletAddress: Address
): string {
  return `tungstone:txs:${chainId}:${(contractAddress || 'none').toLowerCase()}:${walletAddress.toLowerCase()}`;
}

export function loadWalletTransactions(
  chainId: number,
  contractAddress: Address | undefined,
  walletAddress: Address | undefined
): WalletTxRecord[] {
  if (!walletAddress || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(
      storageKey(chainId, contractAddress, walletAddress)
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WalletTxRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveWalletTransaction(
  chainId: number,
  contractAddress: Address | undefined,
  walletAddress: Address | undefined,
  record: WalletTxRecord
): WalletTxRecord[] {
  if (!walletAddress || typeof window === 'undefined') return [];
  const existing = loadWalletTransactions(chainId, contractAddress, walletAddress);
  const idx = existing.findIndex((item) => item.hash === record.hash);
  const next =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? record : item))
      : [record, ...existing].slice(0, 50);

  try {
    window.localStorage.setItem(
      storageKey(chainId, contractAddress, walletAddress),
      JSON.stringify(next)
    );
  } catch {
    // Ignore storage quota errors
  }
  return next;
}
