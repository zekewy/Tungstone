import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ARC_CHAIN_ID } from '../config/arc';

interface WalletActionButtonProps {
  variant?: 'header' | 'prominent';
}

export function WalletActionButton({
  variant = 'header',
}: WalletActionButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const wrongChain = connected && chain.id !== ARC_CHAIN_ID;

        if (!ready) {
          return (
            <div
              aria-hidden="true"
              className="h-10 w-36 rounded-md border border-graphite/20 bg-surface opacity-50"
            />
          );
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={
                variant === 'prominent'
                  ? 'inline-flex min-h-11 items-center justify-center rounded-md border border-graphite bg-lime px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite whitespace-nowrap shrink-0 cursor-pointer'
                  : 'inline-flex min-h-10 items-center justify-center rounded-md border border-graphite bg-lime px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite whitespace-nowrap shrink-0 cursor-pointer'
              }
            >
              Connect Wallet
            </button>
          );
        }

        if (wrongChain) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-graphite bg-error-bg px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.04em] text-error-ink transition-colors duration-150 hover:bg-graphite hover:text-stone-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite whitespace-nowrap shrink-0 cursor-pointer"
            >
              Switch to Arc
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            aria-label={`Connected wallet ${account.displayName}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-graphite bg-graphite px-4 py-2 font-mono text-xs font-medium text-stone-bright transition-colors duration-150 hover:bg-graphite-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <span className="text-lime">ARC</span>
            <span aria-hidden="true" className="text-stone/40">
              /
            </span>
            <span>{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
