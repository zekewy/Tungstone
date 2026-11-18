import type { ReactNode } from 'react';
import { WalletActionButton } from './WalletActionButton';
import { TungstoneLogo } from './TungstoneLogo';

interface WalletGateProps {
  isConnected: boolean;
  isWrongNetwork: boolean;
  isSwitchingChain: boolean;
  onSwitchToArc: () => void;
  title: string;
  description: string;
  children: ReactNode;
}

export function WalletGate({
  isConnected,
  isWrongNetwork,
  isSwitchingChain,
  onSwitchToArc,
  title,
  description,
  children,
}: WalletGateProps) {
  if (!isConnected) {
    return (
      <section
        aria-label="Wallet connection required"
        className="rounded-md border border-graphite bg-surface p-8 md:p-10"
      >
        <div className="flex flex-col items-start gap-5 max-w-xl">
          <TungstoneLogo size={36} />
          <div className="space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-tight text-graphite">
              {title}
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-steel">
              {description}
            </p>
          </div>
          <WalletActionButton variant="prominent" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 font-mono text-xs text-steel">
            <span>Network: Arc</span>
            <span aria-hidden="true">/</span>
            <span>Asset: USDC</span>
            <span aria-hidden="true">/</span>
            <span>Settlement: Anytime</span>
          </div>
        </div>
      </section>
    );
  }

  if (isWrongNetwork) {
    return (
      <section
        aria-label="Arc network required"
        className="rounded-md border border-graphite bg-surface p-8 md:p-10"
      >
        <div className="flex flex-col items-start gap-5 max-w-xl">
          <TungstoneLogo size={36} />
          <div className="space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-tight text-graphite">
              Switch network to Arc
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-steel">
              Your wallet is connected to another network. Switch to Arc to read
              balances and submit vault transactions.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToArc}
            disabled={isSwitchingChain}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-graphite bg-lime px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover disabled:opacity-60 cursor-pointer"
          >
            {isSwitchingChain ? 'Switching Network' : 'Switch to Arc'}
          </button>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
