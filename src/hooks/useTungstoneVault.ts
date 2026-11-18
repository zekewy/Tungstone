import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import type { Abi } from 'viem';
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  EURC_ADDRESS,
  USDC_ADDRESS,
  VAULT_CONTRACT_ADDRESS,
} from '../config/arc';
import {
  ERC20_ABI,
  fetchDeployedContractAbi,
  resolveVaultFunctions,
} from '../lib/abiAdapter';
import {
  loadWalletTransactions,
  saveWalletTransaction,
  type WalletTxAction,
  type WalletTxRecord,
} from '../lib/txLedger';
import { formatTokenAmount, formatTxError } from '../lib/vaultMath';

export type TxLifecyclePhase =
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'error';

export function useTungstoneVault() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const activeChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const isWrongNetwork = isConnected && activeChainId !== ARC_CHAIN_ID;
  const isContractConfigured = Boolean(VAULT_CONTRACT_ADDRESS);
  const canReadUser = Boolean(
    isConnected && address && !isWrongNetwork && VAULT_CONTRACT_ADDRESS
  );

  // 1. Fetch verified ABI from ArcScan if contract address is configured
  const abiQuery = useQuery({
    queryKey: ['tungstone-abi', VAULT_CONTRACT_ADDRESS, ARC_EXPLORER_URL],
    queryFn: () =>
      fetchDeployedContractAbi(VAULT_CONTRACT_ADDRESS, ARC_EXPLORER_URL),
    staleTime: 5 * 60 * 1000,
  });

  const vaultAbi: Abi | undefined = abiQuery.data?.abi;
  const abiSource = abiQuery.data?.source ?? 'unconfigured';
  const contractName = abiQuery.data?.contractName;

  const resolved = useMemo(
    () => (vaultAbi ? resolveVaultFunctions(vaultAbi) : null),
    [vaultAbi]
  );

  // 2. Read real token decimals and symbols on Arc
  const usdcDecimalsRead = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: ARC_CHAIN_ID,
  });

  const usdcSymbolRead = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: ARC_CHAIN_ID,
  });

  const eurcDecimalsRead = useReadContract({
    address: EURC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: ARC_CHAIN_ID,
  });

  const usdcDecimals =
    typeof usdcDecimalsRead.data === 'number'
      ? usdcDecimalsRead.data
      : undefined;
  const usdcSymbol =
    typeof usdcSymbolRead.data === 'string' ? usdcSymbolRead.data : 'USDC';
  const eurcDecimals =
    typeof eurcDecimalsRead.data === 'number'
      ? eurcDecimalsRead.data
      : undefined;

  // 3. Vault-wide public contract reads (only when contract address & function exist)
  const totalDepositedRead = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi,
    functionName: resolved?.totalDepositedView?.name,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(
        VAULT_CONTRACT_ADDRESS && vaultAbi && resolved?.totalDepositedView
      ),
      refetchInterval: 15000,
    },
  });

  const depositorCountRead = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi,
    functionName: resolved?.depositorCountView?.name,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(
        VAULT_CONTRACT_ADDRESS && vaultAbi && resolved?.depositorCountView
      ),
      refetchInterval: 15000,
    },
  });

  const currentRateRead = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi,
    functionName: resolved?.currentRateView?.name,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(
        VAULT_CONTRACT_ADDRESS && vaultAbi && resolved?.currentRateView
      ),
      refetchInterval: 15000,
    },
  });

  // 4. Connected wallet reads (strictly gated on connected wallet + correct network)
  const usdcBalanceRead = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(isConnected && address && !isWrongNetwork),
      refetchInterval: 12000,
    },
  });

  const usdcAllowanceRead = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args:
      address && VAULT_CONTRACT_ADDRESS
        ? [address, VAULT_CONTRACT_ADDRESS]
        : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(canReadUser),
      refetchInterval: 12000,
    },
  });

  const vaultBalanceRead = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi,
    functionName: resolved?.balanceView?.name,
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(canReadUser && vaultAbi && resolved?.balanceView),
      refetchInterval: 12000,
    },
  });

  const earnedYieldRead = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi,
    functionName: resolved?.earnedYieldView?.name,
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(canReadUser && vaultAbi && resolved?.earnedYieldView),
      refetchInterval: 12000,
    },
  });

  // 5. Wallet-scoped transaction ledger
  const [txHistory, setTxHistory] = useState<WalletTxRecord[]>([]);

  useEffect(() => {
    if (!isConnected || !address) {
      setTxHistory([]);
      return;
    }
    setTxHistory(
      loadWalletTransactions(ARC_CHAIN_ID, VAULT_CONTRACT_ADDRESS, address)
    );
  }, [isConnected, address]);

  // 6. Real contract write lifecycle (pending -> confirming -> confirmed)
  const { writeContractAsync, reset: resetWrite } = useWriteContract();
  const [activeTxHash, setActiveTxHash] = useState<`0x${string}` | undefined>();
  const [activeAction, setActiveAction] = useState<WalletTxAction | null>(null);
  const [activeAmountLabel, setActiveAmountLabel] = useState<string>('—');
  const [txPhase, setTxPhase] = useState<TxLifecyclePhase>('idle');
  const [txError, setTxError] = useState<string | null>(null);

  const receipt = useWaitForTransactionReceipt({
    hash: activeTxHash,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: Boolean(activeTxHash),
    },
  });

  const refetchAll = useCallback(() => {
    void Promise.all([
      totalDepositedRead.refetch(),
      depositorCountRead.refetch(),
      currentRateRead.refetch(),
      usdcBalanceRead.refetch(),
      usdcAllowanceRead.refetch(),
      vaultBalanceRead.refetch(),
      earnedYieldRead.refetch(),
      queryClient.invalidateQueries(),
    ]);
  }, [
    totalDepositedRead,
    depositorCountRead,
    currentRateRead,
    usdcBalanceRead,
    usdcAllowanceRead,
    vaultBalanceRead,
    earnedYieldRead,
    queryClient,
  ]);

  useEffect(() => {
    if (!activeTxHash || !activeAction || !address) return;

    if (receipt.isSuccess) {
      setTxPhase('confirmed');
      const updated = saveWalletTransaction(
        ARC_CHAIN_ID,
        VAULT_CONTRACT_ADDRESS,
        address,
        {
          hash: activeTxHash,
          action: activeAction,
          amountFormatted: activeAmountLabel,
          timestamp: Date.now(),
          status: 'confirmed',
        }
      );
      setTxHistory(updated);
      refetchAll();
    } else if (receipt.isError) {
      setTxPhase('error');
      setTxError(formatTxError(receipt.error));
      const updated = saveWalletTransaction(
        ARC_CHAIN_ID,
        VAULT_CONTRACT_ADDRESS,
        address,
        {
          hash: activeTxHash,
          action: activeAction,
          amountFormatted: activeAmountLabel,
          timestamp: Date.now(),
          status: 'failed',
        }
      );
      setTxHistory(updated);
    }
  }, [
    receipt.isSuccess,
    receipt.isError,
    receipt.error,
    activeTxHash,
    activeAction,
    activeAmountLabel,
    address,
    refetchAll,
  ]);

  const resetTxState = useCallback(() => {
    resetWrite();
    setActiveTxHash(undefined);
    setActiveAction(null);
    setActiveAmountLabel('—');
    setTxPhase('idle');
    setTxError(null);
  }, [resetWrite]);

  const executeTx = useCallback(
    async (
      action: WalletTxAction,
      amountLabel: string,
      txCall: () => Promise<`0x${string}`>
    ) => {
      if (!address) return;
      setTxError(null);
      setActiveAction(action);
      setActiveAmountLabel(amountLabel);
      setActiveTxHash(undefined);
      setTxPhase('pending');

      try {
        const hash = await txCall();
        setActiveTxHash(hash);
        setTxPhase('confirming');
        const updated = saveWalletTransaction(
          ARC_CHAIN_ID,
          VAULT_CONTRACT_ADDRESS,
          address,
          {
            hash,
            action,
            amountFormatted: amountLabel,
            timestamp: Date.now(),
            status: 'confirming',
          }
        );
        setTxHistory(updated);
      } catch (err) {
        setTxPhase('error');
        setTxError(formatTxError(err));
      }
    },
    [address]
  );

  const approveUsdc = useCallback(
    async (amountRaw: bigint) => {
      const vaultAddress = VAULT_CONTRACT_ADDRESS;
      if (!vaultAddress || usdcDecimals === undefined) return;
      const label = `${formatTokenAmount(amountRaw, usdcDecimals)} ${usdcSymbol}`;
      await executeTx('Approve USDC', label, () =>
        writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vaultAddress, amountRaw],
          chainId: ARC_CHAIN_ID,
        })
      );
    },
    [executeTx, usdcDecimals, usdcSymbol, writeContractAsync]
  );

  const depositUsdc = useCallback(
    async (amountRaw: bigint) => {
      const vaultAddress = VAULT_CONTRACT_ADDRESS;
      if (
        !vaultAddress ||
        !vaultAbi ||
        !resolved?.depositFn ||
        !address ||
        usdcDecimals === undefined
      ) {
        return;
      }
      const fn = resolved.depositFn;
      const args =
        fn.inputs.length === 2 ? [amountRaw, address] : [amountRaw];
      const label = `${formatTokenAmount(amountRaw, usdcDecimals)} ${usdcSymbol}`;

      await executeTx('Deposit', label, () =>
        writeContractAsync({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: fn.name,
          args,
          chainId: ARC_CHAIN_ID,
        })
      );
    },
    [
      address,
      executeTx,
      resolved?.depositFn,
      usdcDecimals,
      usdcSymbol,
      vaultAbi,
      writeContractAsync,
    ]
  );

  const withdrawAmount = useCallback(
    async (amountRaw: bigint) => {
      const vaultAddress = VAULT_CONTRACT_ADDRESS;
      if (
        !vaultAddress ||
        !vaultAbi ||
        !resolved?.withdrawFn ||
        !address ||
        usdcDecimals === undefined
      ) {
        return;
      }
      const fn = resolved.withdrawFn;
      const args =
        fn.inputs.length === 3
          ? [amountRaw, address, address]
          : fn.inputs.length === 2
            ? [amountRaw, address]
            : [amountRaw];
      const label = `${formatTokenAmount(amountRaw, usdcDecimals)} ${usdcSymbol}`;

      await executeTx('Withdraw', label, () =>
        writeContractAsync({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: fn.name,
          args,
          chainId: ARC_CHAIN_ID,
        })
      );
    },
    [
      address,
      executeTx,
      resolved?.withdrawFn,
      usdcDecimals,
      usdcSymbol,
      vaultAbi,
      writeContractAsync,
    ]
  );

  const withdrawEverything = useCallback(async () => {
    const vaultAddress = VAULT_CONTRACT_ADDRESS;
    if (!vaultAddress || !vaultAbi || !address) return;
    const totalBal =
      typeof vaultBalanceRead.data === 'bigint'
        ? vaultBalanceRead.data
        : 0n;
    const earned =
      typeof earnedYieldRead.data === 'bigint' ? earnedYieldRead.data : 0n;
    const fullAmount = totalBal + earned;
    const label =
      usdcDecimals !== undefined && fullAmount > 0n
        ? `${formatTokenAmount(fullAmount, usdcDecimals)} ${usdcSymbol}`
        : `Full Position`;

    if (resolved?.withdrawAllFn) {
      const fnName = resolved.withdrawAllFn.name;
      await executeTx('Withdraw All', label, () =>
        writeContractAsync({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: fnName,
          args: [],
          chainId: ARC_CHAIN_ID,
        })
      );
      return;
    }

    if (resolved?.withdrawFn && totalBal > 0n) {
      const fn = resolved.withdrawFn;
      const args =
        fn.inputs.length === 3
          ? [totalBal, address, address]
          : fn.inputs.length === 2
            ? [totalBal, address]
            : [totalBal];

      await executeTx('Withdraw All', label, () =>
        writeContractAsync({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: fn.name,
          args,
          chainId: ARC_CHAIN_ID,
        })
      );
    }
  }, [
    address,
    earnedYieldRead.data,
    executeTx,
    resolved?.withdrawAllFn,
    resolved?.withdrawFn,
    usdcDecimals,
    usdcSymbol,
    vaultAbi,
    vaultBalanceRead.data,
    writeContractAsync,
  ]);

  const switchToArc = useCallback(() => {
    switchChain({ chainId: ARC_CHAIN_ID });
  }, [switchChain]);

  return {
    // Connection & network
    address,
    isConnected,
    activeChainId,
    isWrongNetwork,
    isSwitchingChain,
    switchToArc,
    isContractConfigured,

    // ABI inspection
    vaultAbi,
    abiSource,
    abiLoading: abiQuery.isLoading,
    contractName,
    resolvedFunctions: resolved,

    // Real token metadata
    usdcDecimals,
    usdcSymbol,
    eurcDecimals,
    usdcMetadataLoading: usdcDecimalsRead.isLoading,

    // Public vault reads
    totalDeposited: totalDepositedRead.data as bigint | undefined,
    totalDepositedLoading: totalDepositedRead.isLoading,
    totalDepositedError: totalDepositedRead.isError,

    depositorCount: depositorCountRead.data as bigint | undefined,
    depositorCountLoading: depositorCountRead.isLoading,

    currentRate: currentRateRead.data as bigint | undefined,
    currentRateLoading: currentRateRead.isLoading,

    // Connected wallet reads
    usdcBalance: usdcBalanceRead.data as bigint | undefined,
    usdcBalanceLoading: usdcBalanceRead.isLoading,

    usdcAllowance: usdcAllowanceRead.data as bigint | undefined,
    usdcAllowanceLoading: usdcAllowanceRead.isLoading,

    vaultBalance: vaultBalanceRead.data as bigint | undefined,
    vaultBalanceLoading: vaultBalanceRead.isLoading,

    earnedYield: earnedYieldRead.data as bigint | undefined,
    earnedYieldLoading: earnedYieldRead.isLoading,

    // Connected wallet submitted txs
    txHistory,

    // Transaction lifecycle
    txPhase,
    txHash: activeTxHash,
    txAction: activeAction,
    txAmountLabel: activeAmountLabel,
    txError,
    resetTxState,

    // Actions
    approveUsdc,
    depositUsdc,
    withdrawAmount,
    withdrawEverything,
    refetchAll,
  };
}
