export function parseTokenInput(input: string, decimals: number): bigint | null {
  const cleaned = input.trim().replace(/,/g, '');
  if (!cleaned) return null;
  if (!/^\d+(\.\d*)?$/.test(cleaned)) return null;

  const [wholePart, fracPart = ''] = cleaned.split('.');
  if (fracPart.length > decimals) {
    return null;
  }

  const paddedFrac = fracPart.padEnd(decimals, '0');
  const combined = `${wholePart}${paddedFrac}`.replace(/^0+/, '') || '0';
  return BigInt(combined);
}

export function formatTokenAmount(
  raw: bigint | undefined | null,
  decimals: number,
  maxFractionDigits = 2
): string {
  if (raw === undefined || raw === null) return '—';

  const isNegative = raw < 0n;
  const absRaw = isNegative ? -raw : raw;
  const divisor = 10n ** BigInt(decimals);
  const whole = absRaw / divisor;
  const remainder = absRaw % divisor;

  const wholeFormatted = whole.toLocaleString('en-US');

  if (maxFractionDigits <= 0) {
    return `${isNegative ? '-' : ''}${wholeFormatted}`;
  }

  const fracFull = remainder.toString().padStart(decimals, '0');
  const sliced = fracFull.slice(0, Math.min(maxFractionDigits, decimals));
  const padded = sliced.padEnd(Math.min(maxFractionDigits, 2), '0');
  const trimmed =
    maxFractionDigits > 2 ? padded.replace(/0+$/, '').padEnd(2, '0') : padded;

  return `${isNegative ? '-' : ''}${wholeFormatted}.${trimmed}`;
}

export function formatExactTokenInput(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;
  if (remainder === 0n) return whole.toString();
  const frac = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${frac}`;
}

export function formatRateBps(rawRate: bigint | number | undefined | null): string {
  if (rawRate === undefined || rawRate === null) return '—';
  const num = typeof rawRate === 'bigint' ? Number(rawRate) : rawRate;
  if (!Number.isFinite(num)) return '—';

  // Supports basis points (e.g. 485 => 4.85%), 1e18 WAD (e.g. 0.0485e18), or 1e27 RAY
  let pct: number;
  if (num >= 1e24) {
    pct = (num / 1e27) * 100;
  } else if (num >= 1e14) {
    pct = (num / 1e18) * 100;
  } else {
    pct = num / 100;
  }

  return `${pct.toFixed(2)}%`;
}

export function needsApproval(amount: bigint, allowance: bigint | undefined): boolean {
  if (amount <= 0n) return false;
  if (allowance === undefined) return true;
  return allowance < amount;
}

export function computePercentageAmount(balance: bigint, percentage: number): bigint {
  if (balance <= 0n || percentage <= 0) return 0n;
  if (percentage >= 100) return balance;
  return (balance * BigInt(Math.floor(percentage))) / 100n;
}

export function shortenAddress(address: string | undefined): string {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTxError(error: unknown): string {
  if (!error) return 'Transaction failed.';
  const msg = extractErrorMessage(error);

  if (/must has at least one account|at least one account/i.test(msg)) {
    return 'Your wallet has no active account. Create or unlock an account in your wallet extension and try again.';
  }
  if (/user rejected|user denied|rejected the request/i.test(msg)) {
    return 'Signature rejected in wallet.';
  }
  if (/insufficient funds/i.test(msg)) {
    return 'Insufficient funds to cover transaction cost.';
  }
  if (/exceeds balance|transfer amount exceeds/i.test(msg)) {
    return 'Amount exceeds available token balance.';
  }
  if (/allowance/i.test(msg)) {
    return 'Token allowance is insufficient. Approve USDC first.';
  }
  return msg.length > 160 ? `${msg.slice(0, 157)}...` : msg;
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('shortMessage' in error && (error as { shortMessage?: unknown }).shortMessage) {
      return String((error as { shortMessage: unknown }).shortMessage);
    }
    if ('message' in error && (error as { message?: unknown }).message) {
      return String((error as { message: unknown }).message);
    }
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function normalizeWalletRejection(reason: unknown): string | null {
  if (!reason) return null;
  const code =
    typeof reason === 'object' && reason !== null && 'code' in reason
      ? Number((reason as { code?: unknown }).code)
      : undefined;
  const msg = extractErrorMessage(reason);

  if (/must has at least one account|at least one account/i.test(msg)) {
    return 'Your wallet extension has no active account. Unlock or create an account in your wallet and click Connect Wallet again.';
  }
  if (code === 4001 || /user rejected|user denied|UserRejectedRequestError/i.test(msg)) {
    return 'Wallet connection request was rejected.';
  }
  if (code === -32002 || /already pending/i.test(msg)) {
    return 'A wallet connection prompt is already open in your browser extension.';
  }
  return null;
}
