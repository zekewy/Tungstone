import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTokenInput,
  formatTokenAmount,
  formatExactTokenInput,
  formatRateBps,
  needsApproval,
  computePercentageAmount,
  shortenAddress,
  formatTxError,
  normalizeWalletRejection,
} from './vaultMath';

test('parseTokenInput parses 6-decimal USDC amounts accurately', () => {
  assert.equal(parseTokenInput('100', 6), 100_000_000n);
  assert.equal(parseTokenInput('1,250.5', 6), 1_250_500_000n);
  assert.equal(parseTokenInput('0.000001', 6), 1n);
  assert.equal(parseTokenInput('0', 6), 0n);
  assert.equal(parseTokenInput('1.1234567', 6), null);
  assert.equal(parseTokenInput('-10', 6), null);
  assert.equal(parseTokenInput('', 6), null);
});

test('formatTokenAmount formats real token decimals with tabular precision', () => {
  assert.equal(formatTokenAmount(undefined, 6), '—');
  assert.equal(formatTokenAmount(null, 6), '—');
  assert.equal(formatTokenAmount(0n, 6), '0.00');
  assert.equal(formatTokenAmount(1_250_500_000n, 6), '1,250.50');
  assert.equal(formatTokenAmount(1_000_000_000_000_000_000n, 18), '1.00');
  assert.equal(formatExactTokenInput(1_250_500_000n, 6), '1250.5');
});

test('formatRateBps handles bps, WAD, and undefined cleanly', () => {
  assert.equal(formatRateBps(undefined), '—');
  assert.equal(formatRateBps(485n), '4.85%');
  assert.equal(formatRateBps(500), '5.00%');
  assert.equal(formatRateBps(48_500_000_000_000_000n), '4.85%');
});

test('needsApproval enforces strict ERC20 allowance checks', () => {
  assert.equal(needsApproval(0n, 0n), false);
  assert.equal(needsApproval(100n, undefined), true);
  assert.equal(needsApproval(100n, 99n), true);
  assert.equal(needsApproval(100n, 100n), false);
  assert.equal(needsApproval(100n, 500n), false);
});

test('computePercentageAmount computes exact BigInt portions', () => {
  assert.equal(computePercentageAmount(1_000_000n, 25), 250_000n);
  assert.equal(computePercentageAmount(1_000_000n, 50), 500_000n);
  assert.equal(computePercentageAmount(1_000_000n, 75), 750_000n);
  assert.equal(computePercentageAmount(1_000_000n, 100), 1_000_000n);
  assert.equal(computePercentageAmount(0n, 50), 0n);
});

test('shortenAddress and formatTxError return clean UI strings', () => {
  assert.equal(
    shortenAddress('0x3600000000000000000000000000000000000000'),
    '0x3600...0000'
  );
  assert.equal(
    formatTxError(new Error('User rejected the request.')),
    'Signature rejected in wallet.'
  );
  assert.equal(
    formatTxError({ code: 4001, message: 'wallet must has at least one account' }),
    'Your wallet has no active account. Create or unlock an account in your wallet extension and try again.'
  );
  assert.equal(
    normalizeWalletRejection({
      code: 4001,
      message: 'wallet must has at least one account',
    }),
    'Your wallet extension has no active account. Unlock or create an account in your wallet and click Connect Wallet again.'
  );
  assert.equal(
    normalizeWalletRejection({ code: 4001, message: 'User rejected' }),
    'Wallet connection request was rejected.'
  );
  assert.equal(normalizeWalletRejection(new Error('unrelated error')), null);
});
