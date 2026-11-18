import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TungstoneLogo } from './TungstoneLogo';
import { WalletActionButton } from './WalletActionButton';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/deposit', label: 'Deposit', end: false },
  { to: '/position', label: 'My Position', end: false },
  { to: '/withdraw', label: 'Withdraw', end: false },
  { to: '/vault', label: 'Vault', end: false },
];

interface LayoutProps {
  children: ReactNode;
  walletNotice?: string | null;
  onDismissWalletNotice?: () => void;
}

export function Layout({
  children,
  walletNotice,
  onDismissWalletNotice,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone text-graphite">
      {/* Top Bar Contract: 3-zone header separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-graphite bg-stone/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3.5 md:px-10">
          {/* Zone 1: Brand Wordmark + Favicon/Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite"
          >
            <TungstoneLogo size={28} />
            <span className="font-display text-xl font-bold uppercase tracking-[0.02em] text-graphite">
              Tungstone
            </span>
          </Link>

          {/* Zone 2: 5 clean single-line text nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 text-sm font-medium transition-colors duration-150 pb-0.5 border-b-2 ${
                    isActive
                      ? 'border-graphite text-graphite'
                      : 'border-transparent text-steel hover:border-graphite/40 hover:text-graphite'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 primary action + mobile toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <WalletActionButton variant="header" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex md:hidden min-h-10 min-w-10 items-center justify-center rounded-md border border-graphite bg-surface text-graphite cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-graphite bg-surface px-4 py-3 md:hidden"
          >
            <div className="flex flex-col divide-y divide-graphite/15">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 text-sm font-medium ${
                      isActive ? 'font-semibold text-graphite' : 'text-steel'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-12"
      >
        {walletNotice && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-md border border-graphite bg-error-bg px-4 py-3 text-sm font-medium text-error-ink"
          >
            <span>{walletNotice}</span>
            {onDismissWalletNotice && (
              <button
                type="button"
                onClick={onDismissWalletNotice}
                aria-label="Dismiss wallet notice"
                className="shrink-0 rounded-md p-0.5 hover:opacity-75 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {children}
      </motion.main>

      {/* Required Footer on Every Page */}
      <footer className="border-t border-graphite bg-surface">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <div className="flex items-center gap-2.5 text-sm font-medium text-graphite">
            <TungstoneLogo size={20} />
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="decoration-2 underline-offset-4 transition-all duration-150 hover:underline hover:decoration-lime"
            >
              Built by Zeke
            </a>
          </div>
          <p className="text-xs text-steel">
            Tungstone is an independent project running on Arc.
          </p>
        </div>
      </footer>
    </div>
  );
}
