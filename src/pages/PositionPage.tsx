import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { explorerTxUrl } from '../config/arc';
import { useTungstoneVault } from '../hooks/useTungstoneVault';
import {
  formatRateBps,
  formatTokenAmount,
  shortenAddress,
} from '../lib/vaultMath';
import { WalletGate } from '../components/WalletGate';

export function PositionPage() {
  const {
    address,
    isConnected,
    isWrongNetwork,
    isSwitchingChain,
    switchToArc,
    isContractConfigured,
    usdcDecimals,
    usdcSymbol,
    usdcBalance,
    usdcBalanceLoading,
    vaultBalance,
    vaultBalanceLoading,
    earnedYield,
    earnedYieldLoading,
    currentRate,
    txHistory,
  } = useTungstoneVault();

  const decimals = usdcDecimals ?? 6;

  const totalPositionRaw =
    vaultBalance !== undefined && earnedYield !== undefined
      ? vaultBalance + earnedYield
      : vaultBalance !== undefined
        ? vaultBalance
        : undefined;

  return (
    <div className="space-y-8">
      <div className="border-b border-graphite pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
          Account Telemetry
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-graphite md:text-4xl">
          My vault position
        </h1>
      </div>

      <WalletGate
        isConnected={isConnected}
        isWrongNetwork={isWrongNetwork}
        isSwitchingChain={isSwitchingChain}
        onSwitchToArc={switchToArc}
        title="Connect wallet to view your position"
        description="Deposited principal, earned yield, and submitted transaction history belong strictly to your connected wallet and stay hidden until connected."
      >
        <div className="space-y-8">
          {!isContractConfigured && (
            <div className="rounded-md border border-graphite bg-surface p-4 text-sm text-graphite">
              <p className="font-semibold">Vault contract address not configured</p>
              <p className="mt-1 text-steel">
                Your liquid wallet {usdcSymbol} balance is read directly from
                Arc. Vault principal and earned yield will populate once a
                deployed vault contract address is set.
              </p>
            </div>
          )}

          {/* Primary 3-Card Position Grid */}
          <section
            aria-label="Position balances"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <div className="rounded-md border border-graphite bg-surface p-6">
              <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
                Deposited Principal
              </p>
              <p className="mt-3 font-mono text-3xl font-bold text-graphite tabular-nums">
                {vaultBalanceLoading
                  ? 'Reading...'
                  : vaultBalance !== undefined
                    ? `${formatTokenAmount(vaultBalance, decimals)} ${usdcSymbol}`
                    : '—'}
              </p>
              <p className="mt-2 text-xs text-steel">
                Active vault principal for {shortenAddress(address)}
              </p>
            </div>

            <div className="rounded-md border border-graphite bg-graphite p-6 text-stone-bright">
              <p className="font-display text-xs uppercase tracking-[0.06em] text-[#A8B0BA]">
                Earned Yield
              </p>
              <p className="mt-3 font-mono text-3xl font-bold text-lime tabular-nums">
                {earnedYieldLoading
                  ? 'Reading...'
                  : earnedYield !== undefined
                    ? `${formatTokenAmount(earnedYield, decimals)} ${usdcSymbol}`
                    : '—'}
              </p>
              <p className="mt-2 text-xs text-[#C8CDD4]">
                Accrued onchain yield at {formatRateBps(currentRate)} rate
              </p>
            </div>

            <div className="rounded-md border border-graphite bg-surface p-6">
              <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
                Total Position Value
              </p>
              <p className="mt-3 font-mono text-3xl font-bold text-graphite tabular-nums">
                {vaultBalanceLoading || earnedYieldLoading
                  ? 'Reading...'
                  : totalPositionRaw !== undefined
                    ? `${formatTokenAmount(totalPositionRaw, decimals)} ${usdcSymbol}`
                    : '—'}
              </p>
              <p className="mt-2 text-xs text-steel">
                Wallet liquid balance:{' '}
                <span className="font-mono font-medium text-graphite tabular-nums">
                  {usdcBalanceLoading
                    ? 'Reading...'
                    : `${formatTokenAmount(usdcBalance, decimals)} ${usdcSymbol}`}
                </span>
              </p>
            </div>
          </section>

          {/* Direct Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/deposit"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-graphite bg-lime px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover"
            >
              Deposit More {usdcSymbol}
            </Link>
            <Link
              to="/withdraw"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-graphite bg-surface px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-graphite transition-colors duration-150 hover:bg-graphite hover:text-stone-bright"
            >
              Withdraw Funds
            </Link>
          </div>

          {/* Connected Wallet Submitted Activity Ledger */}
          <section aria-labelledby="activity-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-graphite pb-3">
              <h2
                id="activity-heading"
                className="font-display text-2xl font-semibold uppercase tracking-tight text-graphite"
              >
                Submitted transactions
              </h2>
              <span className="font-mono text-xs text-steel">
                {shortenAddress(address)}
              </span>
            </div>

            {txHistory.length === 0 ? (
              <div className="rounded-md border border-graphite bg-surface p-8 text-center">
                <p className="font-display text-lg font-semibold uppercase text-graphite">
                  No transactions submitted from this wallet yet
                </p>
                <p className="mt-2 text-sm text-steel">
                  Real approvals, deposits, and withdrawals you submit from{' '}
                  <span className="font-mono">{shortenAddress(address)}</span>{' '}
                  will appear here with their ArcScan links.
                </p>
                <div className="mt-5">
                  <Link
                    to="/deposit"
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-graphite bg-lime px-5 py-2 font-display text-xs font-semibold uppercase tracking-[0.04em] text-lime-ink hover:bg-lime-hover"
                  >
                    Make First Deposit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-graphite bg-surface">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-graphite bg-stone text-[11px] font-mono uppercase tracking-[0.06em] text-steel">
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3 text-right">Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite/15 text-sm">
                    {txHistory.map((tx) => (
                      <tr key={tx.hash} className="hover:bg-stone-bright/50">
                        <td className="px-4 py-3 font-medium text-graphite">
                          {tx.action}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-graphite tabular-nums">
                          {tx.amountFormatted}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs uppercase text-steel">
                          {tx.status}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-steel tabular-nums">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={explorerTxUrl(tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-graphite underline underline-offset-4 hover:text-steel"
                          >
                            <span>{shortenAddress(tx.hash)}</span>
                            <ExternalLink
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </WalletGate>
    </div>
  );
}
