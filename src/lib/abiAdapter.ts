import type { Abi, AbiFunction, Address } from 'viem';

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export const DEFAULT_VAULT_ABI = [
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdrawAll',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'earnedYield',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalDeposited',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositorCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'currentRate',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export interface ResolvedVaultFunctions {
  depositFn: AbiFunction | null;
  withdrawFn: AbiFunction | null;
  withdrawAllFn: AbiFunction | null;
  balanceView: AbiFunction | null;
  earnedYieldView: AbiFunction | null;
  totalDepositedView: AbiFunction | null;
  depositorCountView: AbiFunction | null;
  currentRateView: AbiFunction | null;
}

function findFn(
  fns: AbiFunction[],
  candidates: string[],
  inputMatcher?: (fn: AbiFunction) => boolean
): AbiFunction | null {
  for (const name of candidates) {
    const match = fns.find(
      (fn) =>
        fn.name.toLowerCase() === name.toLowerCase() &&
        (!inputMatcher || inputMatcher(fn))
    );
    if (match) return match;
  }
  return null;
}

export function resolveVaultFunctions(abi: Abi): ResolvedVaultFunctions {
  const fns = abi.filter((item): item is AbiFunction => item.type === 'function');

  const depositFn = findFn(
    fns,
    ['deposit', 'depositAssets', 'stake', 'supply'],
    (fn) => fn.inputs.length === 1 || fn.inputs.length === 2
  );

  const withdrawFn = findFn(
    fns,
    ['withdraw', 'redeem', 'unstake'],
    (fn) => fn.inputs.length >= 1 && fn.inputs.length <= 3
  );

  const withdrawAllFn = findFn(
    fns,
    ['withdrawAll', 'exit', 'redeemAll', 'withdrawFull'],
    (fn) => fn.inputs.length === 0
  );

  const balanceView = findFn(
    fns,
    [
      'balanceOf',
      'depositedBalance',
      'principalOf',
      'getBalance',
      'userBalance',
      'balance',
    ],
    (fn) =>
      fn.inputs.length === 1 &&
      fn.inputs[0]?.type === 'address' &&
      (fn.stateMutability === 'view' || fn.stateMutability === 'pure')
  );

  const earnedYieldView = findFn(
    fns,
    [
      'earnedYield',
      'accruedYield',
      'earned',
      'yieldOf',
      'pendingYield',
      'getEarnedYield',
      'claimableYield',
    ],
    (fn) =>
      fn.inputs.length === 1 &&
      fn.inputs[0]?.type === 'address' &&
      (fn.stateMutability === 'view' || fn.stateMutability === 'pure')
  );

  const totalDepositedView = findFn(
    fns,
    ['totalDeposited', 'totalAssets', 'totalSupply', 'tvl', 'totalPrincipal'],
    (fn) =>
      fn.inputs.length === 0 &&
      (fn.stateMutability === 'view' || fn.stateMutability === 'pure')
  );

  const depositorCountView = findFn(
    fns,
    ['depositorCount', 'totalDepositors', 'numDepositors', 'depositorsCount'],
    (fn) =>
      fn.inputs.length === 0 &&
      (fn.stateMutability === 'view' || fn.stateMutability === 'pure')
  );

  const currentRateView = findFn(
    fns,
    ['currentRate', 'apy', 'rateBps', 'annualRate', 'yieldRate', 'rate', 'apr'],
    (fn) =>
      fn.inputs.length === 0 &&
      (fn.stateMutability === 'view' || fn.stateMutability === 'pure')
  );

  return {
    depositFn,
    withdrawFn,
    withdrawAllFn,
    balanceView,
    earnedYieldView,
    totalDepositedView,
    depositorCountView,
    currentRateView,
  };
}

export interface AbiFetchResult {
  abi: Abi;
  source: 'arcscan-verified' | 'standard-adapter' | 'unconfigured';
  contractName?: string;
}

const abiCache = new Map<string, AbiFetchResult>();

export async function fetchDeployedContractAbi(
  address: Address | undefined,
  explorerBaseUrl = 'https://testnet.arcscan.app'
): Promise<AbiFetchResult> {
  if (!address) {
    return {
      abi: DEFAULT_VAULT_ABI as unknown as Abi,
      source: 'unconfigured',
    };
  }

  const key = `${explorerBaseUrl}:${address.toLowerCase()}`;
  const cached = abiCache.get(key);
  if (cached) return cached;

  const base = explorerBaseUrl.replace(/\/$/, '');

  // 1. Try Blockscout v2 verified smart contract endpoint
  try {
    const res = await fetch(`${base}/api/v2/smart-contracts/${address}`);
    if (res.ok) {
      const json = (await res.json()) as { abi?: unknown; name?: string };
      if (Array.isArray(json.abi) && json.abi.length > 0) {
        const result: AbiFetchResult = {
          abi: json.abi as Abi,
          source: 'arcscan-verified',
          contractName: json.name,
        };
        abiCache.set(key, result);
        return result;
      }
    }
  } catch {
    // Fall through to Etherscan-compatible endpoint
  }

  // 2. Try Etherscan-compatible getabi endpoint
  try {
    const res = await fetch(
      `${base}/api?module=contract&action=getabi&address=${address}`
    );
    if (res.ok) {
      const json = (await res.json()) as { status?: string; result?: string };
      if (json.status === '1' && typeof json.result === 'string') {
        const parsed = JSON.parse(json.result) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const result: AbiFetchResult = {
            abi: parsed as Abi,
            source: 'arcscan-verified',
          };
          abiCache.set(key, result);
          return result;
        }
      }
    }
  } catch {
    // Fall through to standard adapter
  }

  const fallback: AbiFetchResult = {
    abi: DEFAULT_VAULT_ABI as unknown as Abi,
    source: 'standard-adapter',
  };
  abiCache.set(key, fallback);
  return fallback;
}
