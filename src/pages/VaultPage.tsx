import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import {
  ADMIN_WALLET_ADDRESS,
  ARC_CHAIN_ID,
  EURC_ADDRESS,
  USDC_ADDRESS,
  VAULT_CONTRACT_ADDRESS,
  explorerAddressUrl,
} from '../config/arc';
import { useTungstoneVault } from '../hooks/useTungstoneVault';
import { formatRateBps, formatTokenAmount } from '../lib/vaultMath';

export function VaultPage() {
  const {
    isContractConfigured,
    abiSource,
    abiLoading,
    contractName,
    resolvedFunctions,
    usdcDecimals,
    usdcSymbol,
    eurcDecimals,
    totalDeposited,
    totalDepositedLoading,
    depositorCount,
    depositorCountLoading,
    currentRate,
    currentRateLoading,
  } = useTungstoneVault();

  const [abiExpanded, setAbiExpanded] = useState(false);

  const decimals = usdcDecimals ?? 6;

  const abiSourceLabel =
    abiSource === 'arcscan-verified'
      ? 'Fetched from ArcScan verified contract'
      : abiSource === 'standard-adapter'
        ? 'Standard Vault ABI adapter'
        : 'Awaiting contract address';

  const mappedFunctions = resolvedFunctions
    ? [
        { role: 'Deposit', fn: resolvedFunctions.depositFn },
        { role: 'Withdraw Amount', fn: resolvedFunctions.withdrawFn },
        { role: 'Withdraw Everything', fn: resolvedFunctions.withdrawAllFn },
        { role: 'Wallet Balance View', fn: resolvedFunctions.balanceView },
        { role: 'Earned Yield View', fn: resolvedFunctions.earnedYieldView },
        { role: 'Total Deposited View', fn: resolvedFunctions.totalDepositedView },
        { role: 'Depositor Count View', fn: resolvedFunctions.depositorCountView },
        { role: 'Current Rate View', fn: resolvedFunctions.currentRateView },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-graphite pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
            Contract Inspection
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-graphite md:text-4xl">
            Tungstone vault overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/deposit"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-graphite bg-lime px-5 py-2 font-display text-xs font-semibold uppercase tracking-[0.04em] text-lime-ink hover:bg-lime-hover"
          >
            Deposit USDC
          </Link>
        </div>
      </div>

      {/* Vault Public Telemetry */}
      <section
        aria-label="Vault protocol metrics"
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <div className="rounded-md border border-graphite bg-graphite p-6 text-stone-bright">
          <p className="font-display text-xs uppercase tracking-[0.06em] text-[#A8B0BA]">
            Current Rate
          </p>
          <p className="mt-3 font-mono text-3xl font-bold text-lime tabular-nums">
            {currentRateLoading ? 'Reading...' : formatRateBps(currentRate)}
          </p>
          <p className="mt-2 text-xs text-[#C8CDD4]">
            Live rate read from the vault smart contract
          </p>
        </div>

        <div className="rounded-md border border-graphite bg-surface p-6">
          <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
            Total Deposited
          </p>
          <p className="mt-3 font-mono text-3xl font-bold text-graphite tabular-nums">
            {totalDepositedLoading
              ? 'Reading...'
              : totalDeposited !== undefined
                ? `${formatTokenAmount(totalDeposited, decimals)} ${usdcSymbol}`
                : '—'}
          </p>
          <p className="mt-2 text-xs text-steel">
            Aggregate {usdcSymbol} parked across active depositors
          </p>
        </div>

        <div className="rounded-md border border-graphite bg-surface p-6">
          <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
            Depositor Count
          </p>
          <p className="mt-3 font-mono text-3xl font-bold text-graphite tabular-nums">
            {depositorCountLoading
              ? 'Reading...'
              : depositorCount !== undefined
                ? depositorCount.toLocaleString('en-US')
                : '—'}
          </p>
          <p className="mt-2 text-xs text-steel">
            Unique active vault accounts recorded onchain
          </p>
        </div>
      </section>

      {/* Supported Token Registry on Arc */}
      <section aria-labelledby="assets-heading" className="space-y-4">
        <div className="border-b border-graphite pb-3">
          <h2
            id="assets-heading"
            className="font-display text-2xl font-semibold uppercase tracking-tight text-graphite"
          >
            Arc asset registry
          </h2>
        </div>

        <div className="overflow-x-auto rounded-md border border-graphite bg-surface">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-graphite bg-stone text-[11px] font-mono uppercase tracking-[0.06em] text-steel">
                <th className="px-5 py-3">Asset</th>
                <th className="px-5 py-3">Vault Status</th>
                <th className="px-5 py-3 text-right">Onchain Decimals</th>
                <th className="px-5 py-3 text-right">Token Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite/15 text-sm">
              <tr>
                <td className="px-5 py-3.5 font-mono font-semibold text-graphite">
                  {usdcSymbol}
                </td>
                <td className="px-5 py-3.5 text-graphite">
                  Phase 1 Single Vault Asset
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-graphite tabular-nums">
                  {usdcDecimals !== undefined ? usdcDecimals : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <a
                    href={explorerAddressUrl(USDC_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-graphite underline underline-offset-4 hover:text-steel"
                  >
                    <span>{USDC_ADDRESS}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-mono font-semibold text-graphite">
                  EURC
                </td>
                <td className="px-5 py-3.5 text-steel">
                  Phase 2 Planned Asset
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-graphite tabular-nums">
                  {eurcDecimals !== undefined ? eurcDecimals : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <a
                    href={explorerAddressUrl(EURC_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-graphite underline underline-offset-4 hover:text-steel"
                  >
                    <span>{EURC_ADDRESS}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Contract Configuration & ABI Source of Truth */}
      <section aria-labelledby="contract-heading" className="space-y-4">
        <div className="border-b border-graphite pb-3">
          <h2
            id="contract-heading"
            className="font-display text-2xl font-semibold uppercase tracking-tight text-graphite"
          >
            Contract and ABI metadata
          </h2>
        </div>

        <div className="rounded-md border border-graphite bg-surface">
          <div className="divide-y divide-graphite/15">
            <div className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.05em] text-steel">
                Network
              </span>
              <span className="font-mono text-sm font-medium text-graphite tabular-nums">
                Arc (Chain ID {ARC_CHAIN_ID})
              </span>
            </div>

            <div className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.05em] text-steel">
                Vault Contract
              </span>
              {VAULT_CONTRACT_ADDRESS ? (
                <a
                  href={explorerAddressUrl(VAULT_CONTRACT_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-graphite underline underline-offset-4 hover:text-steel"
                >
                  <span>{VAULT_CONTRACT_ADDRESS}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span className="font-mono text-sm text-steel">
                  Not configured in environment
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.05em] text-steel">
                Admin Wallet
              </span>
              {ADMIN_WALLET_ADDRESS ? (
                <a
                  href={explorerAddressUrl(ADMIN_WALLET_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-graphite underline underline-offset-4 hover:text-steel"
                >
                  <span>{ADMIN_WALLET_ADDRESS}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span className="font-mono text-sm text-steel">
                  Not configured in environment
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.05em] text-steel">
                ABI Resolution
              </span>
              <span className="font-mono text-sm text-graphite">
                {abiLoading
                  ? 'Fetching verified ABI...'
                  : contractName
                    ? `${abiSourceLabel} (${contractName})`
                    : abiSourceLabel}
              </span>
            </div>
          </div>

          <div className="border-t border-graphite">
            <button
              type="button"
              aria-expanded={abiExpanded}
              onClick={() => setAbiExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left font-mono text-xs font-semibold uppercase tracking-[0.05em] text-graphite hover:bg-stone-bright cursor-pointer"
            >
              <span>
                {isContractConfigured
                  ? 'Inspect resolved contract interface'
                  : 'Inspect expected contract interface'}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  abiExpanded ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {abiExpanded && (
              <div className="border-t border-graphite/15 bg-stone-bright px-5 py-4">
                <div className="divide-y divide-graphite/15">
                  {mappedFunctions.map((item) => (
                    <div
                      key={item.role}
                      className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-xs font-medium text-steel">
                        {item.role}
                      </span>
                      <span className="font-mono text-xs text-graphite">
                        {item.fn
                          ? `${item.fn.name}(${item.fn.inputs
                              .map((inp) => `${inp.type}${inp.name ? ` ${inp.name}` : ''}`)
                              .join(', ')})`
                          : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
