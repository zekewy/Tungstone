import test from 'node:test';
import assert from 'node:assert/strict';
import type { Abi } from 'viem';
import { DEFAULT_VAULT_ABI, resolveVaultFunctions } from './abiAdapter';

test('resolveVaultFunctions resolves default Tungstone vault ABI', () => {
  const resolved = resolveVaultFunctions(DEFAULT_VAULT_ABI as unknown as Abi);
  assert.equal(resolved.depositFn?.name, 'deposit');
  assert.equal(resolved.withdrawFn?.name, 'withdraw');
  assert.equal(resolved.withdrawAllFn?.name, 'withdrawAll');
  assert.equal(resolved.balanceView?.name, 'balanceOf');
  assert.equal(resolved.earnedYieldView?.name, 'earnedYield');
  assert.equal(resolved.totalDepositedView?.name, 'totalDeposited');
  assert.equal(resolved.depositorCountView?.name, 'depositorCount');
  assert.equal(resolved.currentRateView?.name, 'currentRate');
});

test('resolveVaultFunctions adapts to alternate ERC4626-like deployed ABI names', () => {
  const customAbi = [
    {
      type: 'function',
      name: 'deposit',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'withdraw',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
        { name: 'owner', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'exit',
      stateMutability: 'nonpayable',
      inputs: [],
      outputs: [],
    },
    {
      type: 'function',
      name: 'principalOf',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'accruedYield',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'totalAssets',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'totalDepositors',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'apy',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    },
  ] as const;

  const resolved = resolveVaultFunctions(customAbi as unknown as Abi);
  assert.equal(resolved.depositFn?.name, 'deposit');
  assert.equal(resolved.depositFn?.inputs.length, 2);
  assert.equal(resolved.withdrawAllFn?.name, 'exit');
  assert.equal(resolved.balanceView?.name, 'principalOf');
  assert.equal(resolved.earnedYieldView?.name, 'accruedYield');
  assert.equal(resolved.totalDepositedView?.name, 'totalAssets');
  assert.equal(resolved.depositorCountView?.name, 'totalDepositors');
  assert.equal(resolved.currentRateView?.name, 'apy');
});
