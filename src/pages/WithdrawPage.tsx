import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTungstoneVault } from '../hooks/useTungstoneVault';
import {
  computePercentageAmount,
  formatExactTokenInput,
  formatTokenAmount,
  parseTokenInput,
} from '../lib/vaultMath';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';

const PERCENT_OPTIONS = [25, 50, 75, 100] as const;

export function WithdrawPage() {
  const {
    isConnected,
    isWrongNetwork,
    isSwitchingChain,
    switchToArc,
    isContractConfigured,
    usdcDecimals,
    usdcSymbol,
    usdcMetadataLoading,
    vaultBalance,
    vaultBalanceLoading,
    earnedYield,
    earnedYieldLoading,
    txPhase,
    txHash,
    txAction,
    txAmountLabel,
    txError,
    resetTxState,
    withdrawAmount,
    withdrawEverything,
  } = useTungstoneVault();

  const [amountInput, setAmountInput] = useState('');

  const decimalsReady = usdcDecimals !== undefined;
  const decimals = usdcDecimals ?? 6;

  const totalWithdrawable = useMemo(() => {
    if (vaultBalance === undefined && earnedYield === undefined) return undefined;
    return (vaultBalance ?? 0n) + (earnedYield ?? 0n);
  }, [vaultBalance, earnedYield]);

  const parsedAmount = useMemo(() => {
    if (!decimalsReady) return null;
    return parseTokenInput(amountInput, decimals);
  }, [amountInput, decimals, decimalsReady]);

  const isBusy = txPhase === 'pending' || txPhase === 'confirming';

  const validationError = useMemo(() => {
    if (!amountInput.trim()) return null;
    if (!decimalsReady) return 'Reading token decimals from Arc.';
    if (parsedAmount === null) {
      return `Enter a valid ${usdcSymbol} amount with up to ${decimals} decimal places.`;
    }
    if (parsedAmount <= 0n) {
      return 'Withdrawal amount must be greater than zero.';
    }
    if (totalWithdrawable !== undefined && parsedAmount > totalWithdrawable) {
      return `Amount exceeds your available ${usdcSymbol} position.`;
    }
    return null;
  }, [
    amountInput,
    decimals,
    decimalsReady,
    parsedAmount,
    totalWithdrawable,
    usdcSymbol,
  ]);

  const handlePercentSelect = (pct: number) => {
    if (totalWithdrawable === undefined || !decimalsReady) return;
    const raw = computePercentageAmount(totalWithdrawable, pct);
    setAmountInput(formatExactTokenInput(raw, decimals));
    if (txPhase === 'confirmed' || txPhase === 'error') {
      resetTxState();
    }
  };

  const handlePartialWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isContractConfigured || !parsedAmount || parsedAmount <= 0n || validationError) {
      return;
    }
    await withdrawAmount(parsedAmount);
  };

  const handleWithdrawAll = async () => {
    if (!isContractConfigured || !totalWithdrawable || totalWithdrawable <= 0n) {
      return;
    }
    await withdrawEverything();
  };

  const hasZeroPosition =
    isContractConfigured &&
    !vaultBalanceLoading &&
    !earnedYieldLoading &&
    totalWithdrawable !== undefined &&
    totalWithdrawable === 0n;

  return (
    <div className="space-y-8">
      <div className="border-b border-graphite pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
          Instant Liquidity
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-graphite md:text-4xl">
          Withdraw USDC anytime
        </h1>
      </div>

      <WalletGate
        isConnected={isConnected}
        isWrongNetwork={isWrongNetwork}
        isSwitchingChain={isSwitchingChain}
        onSwitchToArc={switchToArc}
        title="Connect wallet to withdraw"
        description="Your deposited principal and withdrawal controls remain hidden until you connect your wallet on Arc."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Columns: Partial Withdraw Form */}
          <form
            onSubmit={handlePartialWithdraw}
            className="lg:col-span-7 flex flex-col justify-between rounded-md border border-graphite bg-surface p-6 md:p-8 space-y-6"
          >
            {!isContractConfigured && (
              <div className="rounded-md border border-graphite bg-stone p-4 text-sm text-graphite">
                <p className="font-semibold">Vault contract address not configured</p>
                <p className="mt-1 text-steel">
                  Configure a deployed vault contract address to read your
                  deposited balance and execute withdrawals.
                </p>
              </div>
            )}

            {hasZeroPosition && (
              <div className="rounded-md border border-graphite bg-stone p-4 text-sm text-graphite flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">No deposited balance found</p>
                  <p className="text-steel">
                    Deposit {usdcSymbol} into the vault before submitting a
                    withdrawal.
                  </p>
                </div>
                <Link
                  to="/deposit"
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-graphite bg-lime px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-lime-ink hover:bg-lime-hover"
                >
                  Go to Deposit
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="withdraw-amount"
                  className="font-display text-sm font-semibold uppercase tracking-[0.04em] text-graphite"
                >
                  Withdraw Any Amount
                </label>
                <span className="font-mono text-xs text-steel tabular-nums">
                  Available:{' '}
                  {vaultBalanceLoading || earnedYieldLoading
                    ? 'Reading...'
                    : `${formatTokenAmount(totalWithdrawable, decimals)} ${usdcSymbol}`}
                </span>
              </div>

              <div className="flex items-center rounded-md border border-graphite bg-stone-bright px-4 py-3 focus-within:outline-2 focus-within:outline-graphite">
                <input
                  id="withdraw-amount"
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

              <div className="grid grid-cols-4 gap-2">
                {PERCENT_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={
                      isBusy ||
                      totalWithdrawable === undefined ||
                      totalWithdrawable === 0n
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
              {isBusy && txAction === 'Withdraw'
                ? txPhase === 'pending'
                  ? 'Confirm In Wallet'
                  : 'Confirming Withdrawal'
                : `Withdraw ${usdcSymbol}`}
            </button>
          </form>

          {/* Right 5 Columns: Full Exit Action */}
          <aside className="lg:col-span-5 flex flex-col justify-between rounded-md border border-graphite bg-graphite p-6 md:p-8 text-stone-bright space-y-6">
            <div className="space-y-5">
              <div className="border-b border-stone/15 pb-3">
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-[#A8B0BA]">
                  Full Redemption
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold uppercase text-stone-bright">
                  Withdraw everything
                </h2>
              </div>

              <div className="divide-y divide-stone/15">
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Deposited Principal</span>
                  <span className="font-mono font-semibold text-stone-bright tabular-nums">
                    {vaultBalanceLoading
                      ? 'Reading...'
                      : vaultBalance !== undefined
                        ? `${formatTokenAmount(vaultBalance, decimals)} ${usdcSymbol}`
                        : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Earned Yield</span>
                  <span className="font-mono font-semibold text-lime tabular-nums">
                    {earnedYieldLoading
                      ? 'Reading...'
                      : earnedYield !== undefined
                        ? `${formatTokenAmount(earnedYield, decimals)} ${usdcSymbol}`
                        : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Total Claimable</span>
                  <span className="font-mono text-base font-bold text-stone-bright tabular-nums">
                    {vaultBalanceLoading || earnedYieldLoading
                      ? 'Reading...'
                      : totalWithdrawable !== undefined
                        ? `${formatTokenAmount(totalWithdrawable, decimals)} ${usdcSymbol}`
                        : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3.5 text-sm">
                  <span className="text-[#A8B0BA]">Token Precision</span>
                  <span className="font-mono text-stone-bright tabular-nums">
                    {usdcMetadataLoading
                      ? 'Reading...'
                      : usdcDecimals !== undefined
                        ? `${usdcDecimals} decimals`
                        : '—'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={
                !isContractConfigured ||
                isBusy ||
                !totalWithdrawable ||
                totalWithdrawable <= 0n
              }
              onClick={handleWithdrawAll}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-stone/25 bg-stone-bright px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.04em] text-graphite transition-colors duration-150 hover:border-lime hover:bg-lime disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
            >
              {isBusy && txAction === 'Withdraw All'
                ? txPhase === 'pending'
                  ? 'Confirm In Wallet'
                  : 'Confirming Full Exit'
                : 'Withdraw Everything'}
            </button>
          </aside>
        </div>
      </WalletGate>
    </div>
  );
}
