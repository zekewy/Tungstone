import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTungstoneVault } from '../hooks/useTungstoneVault';
import { formatRateBps, formatTokenAmount } from '../lib/vaultMath';

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Single vault live',
    status: 'Current release',
    description:
      'USDC tokenized treasury vault available on Arc with instant deposit, real-time balance tracking, and anytime withdrawal.',
  },
  {
    phase: 'Phase 2',
    title: 'EURC vault',
    status: 'Upcoming',
    description:
      'Euro-denominated reserve vault supporting EURC deposits with isolated accounting and dedicated treasury allocation.',
  },
  {
    phase: 'Phase 3',
    title: 'Auto compounding view and statements',
    status: 'Planned',
    description:
      'Period-by-period compounding breakdowns and downloadable accounting statements for treasury operators.',
  },
  {
    phase: 'Phase 4',
    title: 'More yield sources',
    status: 'Planned',
    description:
      'Modular expansion across verified institutional fixed-income instruments with transparent allocation weights.',
  },
];

const FAQ_ITEMS = [
  {
    id: 'lockup',
    question: 'Is there a lockup',
    answer:
      'No. Tungstone imposes no lockup period, vesting schedule, or withdrawal cooldown. You can withdraw any partial amount or exit your entire balance whenever you choose.',
  },
  {
    id: 'yield-source',
    question: 'Where does the yield come from',
    answer:
      'Yield is generated from tokenized short-duration U.S. Treasury instruments backed by cash equivalents and government debt obligations, passed through to depositors onchain.',
  },
  {
    id: 'risks',
    question: 'What are the risks',
    answer:
      'Key risks include smart contract vulnerabilities in the vault or underlying token contracts, issuer and custodial counterparty risk on tokenized treasury assets, and short-term rate fluctuations. Only deposit funds you understand how to manage onchain.',
  },
  {
    id: 'withdrawal-speed',
    question: 'How fast is a withdrawal',
    answer:
      'Withdrawals execute directly through the vault smart contract on Arc. Once you sign the transaction in your wallet, funds settle to your address as soon as the block confirms.',
  },
];

export function HomePage() {
  const {
    isContractConfigured,
    usdcDecimals,
    usdcSymbol,
    totalDeposited,
    totalDepositedLoading,
    depositorCount,
    depositorCountLoading,
    currentRate,
    currentRateLoading,
  } = useTungstoneVault();

  const [openFaqId, setOpenFaqId] = useState<string | null>('lockup');

  const decimals = usdcDecimals ?? 6;
  const formattedRate = currentRateLoading
    ? 'Reading...'
    : formatRateBps(currentRate);
  const formattedTotal = totalDepositedLoading
    ? 'Reading...'
    : totalDeposited !== undefined
      ? `${formatTokenAmount(totalDeposited, decimals)} ${usdcSymbol}`
      : '—';
  const formattedDepositors = depositorCountLoading
    ? 'Reading...'
    : depositorCount !== undefined
      ? depositorCount.toLocaleString('en-US')
      : '—';

  return (
    <div className="space-y-16">
      {/* Hero Asymmetric 12-Column Split */}
      <section
        aria-label="Hero"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch"
      >
        <div className="lg:col-span-8 flex flex-col justify-between rounded-md border border-graphite bg-surface p-7 md:p-10">
          <div className="space-y-5">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-steel">
              Available on Arc / Tokenized Treasury Yield
            </p>
            <h1 className="font-display text-4xl font-bold uppercase leading-[1.04] tracking-[-0.02em] text-graphite sm:text-5xl lg:text-[56px]">
              Park idle USDC in tokenized treasury yield
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-steel md:text-lg">
              Tungstone is a focused yield tool built on Arc. Deposit USDC into
              a single transparent vault, observe your earned yield grow onchain,
              and withdraw any amount anytime.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/deposit"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-graphite bg-lime px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-lime-ink transition-colors duration-150 hover:bg-lime-hover"
            >
              <span>Deposit USDC</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/vault"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-graphite bg-surface px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.04em] text-graphite transition-colors duration-150 hover:bg-graphite hover:text-stone-bright"
            >
              Inspect Vault
            </Link>
          </div>
        </div>

        {/* Right Inverted Structural Graphite Telemetry Panel */}
        <aside
          aria-label="Live vault telemetry"
          className="lg:col-span-4 flex flex-col justify-between rounded-md border border-graphite bg-graphite p-7 text-stone-bright"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone/15 pb-3">
              <span className="font-display text-xs font-medium uppercase tracking-[0.08em] text-[#A8B0BA]">
                Live Vault Rate
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.06em] text-lime">
                {usdcSymbol}
              </span>
            </div>

            <div>
              <div className="font-mono text-4xl font-bold tracking-tight text-lime tabular-nums md:text-[42px]">
                {formattedRate}
              </div>
              <p className="mt-1.5 text-xs text-[#A8B0BA]">
                {isContractConfigured
                  ? 'Read directly from the deployed vault contract on Arc'
                  : 'Connect a deployed vault contract address to stream live rates'}
              </p>
            </div>

            <div className="divide-y divide-stone/15 border-t border-b border-stone/15">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs uppercase tracking-[0.05em] text-[#A8B0BA]">
                  Total Deposited
                </span>
                <span className="font-mono text-sm font-semibold text-stone-bright tabular-nums">
                  {formattedTotal}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs uppercase tracking-[0.05em] text-[#A8B0BA]">
                  Depositors
                </span>
                <span className="font-mono text-sm font-semibold text-stone-bright tabular-nums">
                  {formattedDepositors}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs uppercase tracking-[0.05em] text-[#A8B0BA]">
                  Token Precision
                </span>
                <span className="font-mono text-sm font-semibold text-stone-bright tabular-nums">
                  {usdcDecimals !== undefined ? `${usdcDecimals} decimals` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/position"
              className="flex w-full min-h-10 items-center justify-center rounded-md border border-stone/25 bg-graphite-hover px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.05em] text-stone-bright transition-colors duration-150 hover:border-lime hover:text-lime"
            >
              View My Position
            </Link>
          </div>
        </aside>
      </section>

      {/* 4-Column KPI Summary Strip */}
      <section aria-label="Vault highlights">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-surface p-6">
            <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
              Current Rate
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-graphite tabular-nums">
              {formattedRate}
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
              Total Deposited
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-graphite tabular-nums">
              {formattedTotal}
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
              Active Depositors
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-graphite tabular-nums">
              {formattedDepositors}
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-xs uppercase tracking-[0.06em] text-steel">
              Withdrawal Window
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-graphite">
              Anytime
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" aria-labelledby="about-heading" className="space-y-6">
        <div className="border-b border-graphite pb-4">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
            About Tungstone
          </p>
          <h2
            id="about-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase tracking-tight text-graphite md:text-4xl"
          >
            How deposited funds earn treasury yield
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-md border border-graphite bg-surface p-6">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
              01 Deposit
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase text-graphite">
              Approve and enter vault
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Connect your wallet on Arc, approve the exact USDC allowance, and
              deposit into the vault contract. Every unit is accounted for
              onchain against your connected address.
            </p>
          </article>

          <article className="rounded-md border border-graphite bg-surface p-6">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
              02 Treasury Allocation
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase text-graphite">
              Backed by tokenized treasuries
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Deposited USDC is routed into tokenized short-duration treasury
              yield instruments. Return comes from underlying government bill
              yield rather than inflationary token emissions.
            </p>
          </article>

          <article className="rounded-md border border-graphite bg-surface p-6">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
              03 Liquidity
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase text-graphite">
              Withdraw partial or full
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Monitor principal and earned yield from your position view. Exit
              any specific amount or withdraw everything in a single contract
              call without lockup periods.
            </p>
          </article>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        aria-labelledby="roadmap-heading"
        className="space-y-6"
      >
        <div className="border-b border-graphite pb-4">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
            Release Schedule
          </p>
          <h2
            id="roadmap-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase tracking-tight text-graphite md:text-4xl"
          >
            Tungstone roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-graphite bg-graphite md:grid-cols-2 lg:grid-cols-4">
          {ROADMAP_PHASES.map((item, idx) => (
            <article
              key={item.phase}
              className={`flex flex-col justify-between p-6 ${
                idx === 0 ? 'bg-graphite text-stone-bright' : 'bg-surface'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-xs font-semibold uppercase tracking-[0.06em] ${
                      idx === 0 ? 'text-lime' : 'text-steel'
                    }`}
                  >
                    {item.phase}
                  </span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.05em] ${
                      idx === 0 ? 'text-stone-bright' : 'text-steel'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3
                  className={`mt-3 font-display text-xl font-semibold uppercase ${
                    idx === 0 ? 'text-stone-bright' : 'text-graphite'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`mt-2.5 text-sm leading-relaxed ${
                    idx === 0 ? 'text-[#C8CDD4]' : 'text-steel'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
        <div className="border-b border-graphite pb-4">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-steel">
            Protocol Clarity
          </p>
          <h2
            id="faq-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase tracking-tight text-graphite md:text-4xl"
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="divide-y divide-graphite rounded-md border border-graphite bg-surface">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() =>
                    setOpenFaqId((curr) => (curr === item.id ? null : item.id))
                  }
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-stone-bright cursor-pointer"
                >
                  <span className="font-display text-lg font-semibold uppercase tracking-tight text-graphite md:text-xl">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-graphite transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    className="border-t border-graphite/15 bg-stone-bright/60 px-6 py-4 text-sm leading-relaxed text-steel md:text-base"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
