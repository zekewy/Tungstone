import { ExternalLink, X } from 'lucide-react';
import { explorerTxUrl } from '../config/arc';
import type { TxLifecyclePhase } from '../hooks/useTungstoneVault';
import type { WalletTxAction } from '../lib/txLedger';
import { shortenAddress } from '../lib/vaultMath';

interface TxStatusBannerProps {
  phase: TxLifecyclePhase;
  action: WalletTxAction | null;
  amountLabel: string;
  txHash?: `0x${string}`;
  errorMessage: string | null;
  onDismiss: () => void;
}

export function TxStatusBanner({
  phase,
  action,
  amountLabel,
  txHash,
  errorMessage,
  onDismiss,
}: TxStatusBannerProps) {
  if (phase === 'idle') return null;

  const isError = phase === 'error';
  const isConfirmed = phase === 'confirmed';

  const labelMap: Record<Exclude<TxLifecyclePhase, 'idle'>, string> = {
    pending: 'Awaiting Wallet Signature',
    confirming: 'Confirming On Arc',
    confirmed: 'Confirmed Onchain',
    error: 'Transaction Failed',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-md border border-graphite p-4 ${
        isError
          ? 'bg-error-bg text-error-ink'
          : isConfirmed
            ? 'bg-lime text-lime-ink'
            : 'bg-graphite text-stone-bright'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.06em]">
            <span className="font-semibold">{labelMap[phase]}</span>
            {action && (
              <>
                <span aria-hidden="true">/</span>
                <span>{action}</span>
              </>
            )}
            {amountLabel && amountLabel !== '—' && (
              <>
                <span aria-hidden="true">/</span>
                <span className="tabular-nums">{amountLabel}</span>
              </>
            )}
          </div>

          {isError && errorMessage && (
            <p className="text-sm font-medium">{errorMessage}</p>
          )}

          {!isError && phase === 'pending' && (
            <p className="text-sm opacity-90">
              Confirm the transaction prompt in your connected wallet.
            </p>
          )}

          {!isError && phase === 'confirming' && (
            <p className="text-sm opacity-90">
              Transaction submitted. Waiting for block confirmation on Arc.
            </p>
          )}

          {!isError && phase === 'confirmed' && (
            <p className="text-sm font-medium">
              Contract state updated and verified on Arc.
            </p>
          )}

          {txHash && (
            <a
              href={explorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs underline underline-offset-4 hover:opacity-80"
            >
              <span>View on ArcScan ({shortenAddress(txHash)})</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {(isConfirmed || isError) && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss transaction status"
            className="rounded-md p-1 transition-opacity hover:opacity-75 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
