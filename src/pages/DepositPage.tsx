import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  USDC_ADDRESS,
  VAULT_CONTRACT_ADDRESS,
  explorerAddressUrl,
} from '../config/arc';
import { useTungstoneVault } from '../hooks/useTungstoneVault';
import {
  computePercentageAmount,
  formatExactTokenInput,
  formatRateBps,
  formatTokenAmount,
  needsApproval,
  parseTokenInput,
  shortenAddress,
} from '../lib/vaultMath';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';

const PERCENT_OPTIONS = [25, 50, 75, 100] as const;

export function DepositPage() {
  const {
    isConnected,
    isWrongNetwork,
    isSwitchingChain,
    switchToArc,
    isContractConfigured,
    usdcDecimals,
    usdcSymbol,
    usdcMetadataLoading,
    usdcBalance,
    usdcBalanceLoading,
    usdcAllowance,
    usdcAllowanceLoading,
    currentRate,
    txPhase,
    txHash,
    txAction,
    txAmountLabel,
    txError,
    resetTxState,
    approveUsdc,
    depositUsdc,
  } = useTungstoneVault();

  const [amountInput, setAmountInput] = useState('');

  const decimalsReady = usdcDecimals !== undefined;
  const decimals = usdcDecimals ?? 6;

  const parsedAmount = useMemo(() => {
    if (!decimalsReady) return null;
    return parseTokenInput(amountInput, decimals);
  }, [amountInput, decimals, decimalsReady]);

  const isBusy = txPhase === 'pending' || txPhase === 'confirming';
  const requiresApproval = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0n) return false;
    return needsApproval(parsedAmount, usdcAllowance);
  }, [parsedAmount, usdcAllowance]);

  const validationError = useMemo(() => {
    if (!amountInput.trim()) return null;
    if (!decimalsReady) return 'Reading token decimals from Arc.';
    if (parsedAmount === null) {
      return `Enter a valid ${usdcSymbol} amount with up to ${decimals} decimal places.`;
    }
    if (parsedAmount <= 0n) {
      return 'Amount must be greater than zero.';
    }
    if (usdcBalance !== undefined && parsedAmount > usdcBalance) {
      return `Amount exceeds your wallet ${usdcSymbol} balance.`;
    }
    return null;
  }, [amountInput, decimals, decimalsReady, parsedAmount, usdcBalance, usdcSymbol]);

  const handlePercentSelect = (pct: number) => {
    if (usdcBalance === undefined || !decimalsReady) return;
    const raw = computePercentageAmount(usdcBalance, pct);
    setAmountInput(formatExactTokenInput(raw, decimals));
    if (txPhase === 'confirmed' || txPhase === 'error') {
      resetTxState();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isContractConfigured || !parsedAmount || parsedAmount <= 0n || validationError) {
      return;
    }
    if (requiresApproval) {
      await approveUsdc(parsedAmount);
    } else {
      await depositUsdc(parsedAmount);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-graphite pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
          Vault Execution
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-graphite md:text-4xl">
          Deposit USDC into treasury yield
        </h1>
      </div>

      <WalletGate
        isConnected={isConnected}
        isWrongNetwork={isWrongNetwork}
        isSwitchingChain={isSwitchingChain}
        onSwitchToArc={switchToArc}
        title="Connect wallet to deposit"
        description="Wallet balances, USDC allowances, and deposit controls stay hidden until you connect your wallet on Arc."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Columns: Deposit Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 flex flex-col justify-between rounded-md border border-graphite bg-surface p-6 md:p-8 space-y-6"
          >
            {!isContractConfigured && (
              <div className="rounded-md border border-graphite bg-stone p-4 text-sm text-graphite">
                <p className="font-semibold">Vault contract address not configured</p>
                <p className="mt-1 text-steel">
                  Set a deployed vault address in the environment configuration to
                  enable onchain approvals and deposits.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="deposit-amount"
                  className="font-display text-sm font-semibold uppercase tracking-[0.04em] text-graphite"
                >
                  Deposit Amount
                </label>
                <span className="font-mono text-xs text-steel tabular-nums">
                  Available:{' '}
                  {usdcBalanceLoading
                    ? 'Reading...'
                    : `${formatTokenAmount(usdcBalance, decimals)} ${usdcSymbol}`}
                </span>
              </div>

              <div className="flex items-center rounded-md border border-graphite bg-stone-bright px-4 py-3 focus-within:outline-2 focus-within:outline-graphite">
                <input
                  id="deposit-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (txPhase === 'confirmed' || txPhase === 'error') {
                      resetTxState();
                    }
                  }}
                  disabled={isBusy}
                  className="w-full bg-transparent font-mono text-2xl font-bold text-graphite placeholder:text-steel/45 focus:outline-none tabular-nums"
                />
                <span className="ml-3 shrink-0 font-mono text-sm font-semibold text-steel">
                  {usdcSymbol}
                </span>
              </div>

              {/* Segmented Quick Percentage Controls */}
              <div className="grid grid-cols-4 gap-2">
                {PERCENT_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={
                      isBusy || usdcBalance === undefined || usdcBalance === 0n
                    }
                    onClick={() => handlePercentSelect(pct)}
                    className="min-h-10 rounded-md border border-graphite/30 bg-stone py-1.5 font-mono text-xs font-semibold text-graphite transition-colors duration-150 hover:border-graphite hover:bg-graphite hover:text-stone-bright disabled:opacity-45 cursor-pointer"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>

              {validationError && (
                <p
                  role="alert"
                  className="rounded-md border border-graphite bg-error-bg px-3.5 py-2.5 text-xs font-medium text-error-ink"
                >
                  {validationError}
                </p>
              )}
            </div>

            {/* Allowance Check Matrix */}
            <div className="divide-y divide-graphite/15 rounded-md border border-graphite/25 bg-stone/60 px-4">
              <div className="flex items-center justify-between py-3 text-xs">
                <span className="text-steel">Current {usdcSymbol} Allowance</span>
                <span className="font-mono font-semibold text-graphite tabular-nums">
                  {!isContractConfigured
                    ? '—'
                    : usdcAllowanceLoading
                      ? 'Reading...'
                      : `${formatTokenAmount(usdcAllowance, decimals)} ${usdcSymbol}`}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 text-xs">
                <span className="text-steel">Next Required Step</span>
                <span className="font-mono font-semibold text-graphite">
                  {!parsedAmount || parsedAmount <= 0n
                    ? 'Enter amount'
                    : requiresApproval
                      ? `1. Approve ${usdcSymbol}  2. Deposit`
                      : `Deposit ${usdcSymbol}`}
                </span>
              </div>
            </div>

            <TxStatusBanner
              phase={txPhase}
              action={txAction}
              amountLabel={txAmountLabel}
              txHash={txHash}
              errorMessage={txError}
              onDismiss={resetTxState}
            />

            <button
              type="submit"
              disabled={
                !isContractConfigured ||
                isBusy ||
                !decimalsReady ||
                !parsedAmount ||
                parsedAmount <= 0n ||
                Boolean(validationError)
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-graphite bg-lime px-6 py-3 font-display text-base font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
            >
              {isBusy
                ? txPhase === 'pending'
                  ? 'Confirm In Wallet'
                  : 'Confirming Transaction'
                : requiresApproval
                  ? `Approve ${usdcSymbol}`
                  : `Deposit ${usdcSymbol}`}
            </button>
          </form>

          {/* Right 5 Columns: Summary & Contract Reference */}
          <aside className="lg:col-span-5 flex flex-col justify-between rounded-md border border-graphite bg-graphite p-6 md:p-8 text-stone-bright space-y-6">
            <div className="space-y-5">
              <div className="border-b border-stone/15 pb-3">
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-[#A8B0BA]">
                  Vault Terms
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold uppercase text-stone-bright">
                  Deposit summary
                </h2>
              </div>

              <div className="divide-y divide-stone/15">
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Current Rate</span>
                  <span className="font-mono text-base font-bold text-lime tabular-nums">
                    {formatRateBps(currentRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Asset Decimals</span>
                  <span className="font-mono text-stone-bright tabular-nums">
                    {usdcMetadataLoading
                      ? 'Reading...'
                      : usdcDecimals !== undefined
                        ? usdcDecimals
                        : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Lockup Period</span>
                  <span className="font-mono text-stone-bright">None</span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Token Contract</span>
                  <a
                    href={explorerAddressUrl(USDC_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-stone-bright underline underline-offset-4 hover:text-lime"
                  >
                    <span>{shortenAddress(USDC_ADDRESS)}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Vault Contract</span>
                  {VAULT_CONTRACT_ADDRESS ? (
                    <a
                      href={explorerAddressUrl(VAULT_CONTRACT_ADDRESS)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-stone-bright underline underline-offset-4 hover:text-lime"
                    >
                      <span>{shortenAddress(VAULT_CONTRACT_ADDRESS)}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-[#A8B0BA]">
                      Not configured
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-stone/15 pt-4 text-xs leading-relaxed text-[#C8CDD4]">
              ERC20 approval is checked against your connected wallet before
              every deposit. Once approved, the deposit transfers {usdcSymbol}{' '}
              directly to the vault contract on Arc.
            </div>

            <Link
              to="/position"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-stone/25 bg-graphite-hover px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.05em] text-stone-bright transition-colors hover:border-lime hover:text-lime"
            >
              Inspect My Position
            </Link>
          </aside>
        </div>
      </WalletGate>
    </div>
  );
}
