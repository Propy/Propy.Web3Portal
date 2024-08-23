import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCapabilities, useWriteContracts, useCallsStatus } from "wagmi/experimental";
import { toast } from 'sonner';

type TransactionType = 'traditional' | 'accountAbstraction';

interface UseUnifiedTransactionProps {
  transactionType: TransactionType;
  contractConfig: any; // TODO improve type
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

export function useUnifiedWriteContract({
  transactionType,
  contractConfig,
  onSuccess,
  onError,
  onSettled,
}: UseUnifiedTransactionProps) {

  const account = useAccount();

  const hasHandledTransaction = useRef(false);

  const [isAwaitingWalletInteraction, setIsAwaitingWalletInteraction] = useState(false);
  const [isAwaitingTx, setIsAwaitingTx] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(undefined);
  const [hasGivenTxClosure, setHasGivenTxClosure] = useState(false);

  // Traditional transaction hooks
  const { 
    data: traditionalData,
    isPending: isLoadingTraditional,
    writeContractAsync: writeTraditional
  } = useWriteContract();

  const traditionalReceipt = useWaitForTransactionReceipt({
    hash: traditionalData,
    confirmations: 2,
  });

  // Account abstraction hooks
  const { 
    data: aaData,
    isPending: isLoadingAA,
    writeContractsAsync: writeAA
  } = useWriteContracts({
    mutation: { onSuccess: (id: string) => setTxId(id) },
  });

  const aaCallStatus = useCallsStatus({
    id: aaData ? aaData : "",
  });

  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    console.log({capabilitiesForChain})
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: `https://3583aaccfd0a.ngrok.app/paymaster`,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);

  // Unified status effect
  useEffect(() => {
    if (hasHandledTransaction.current) return;

    const handleTransactionStatus = () => {
      if (transactionType === 'traditional' && traditionalReceipt) {
        if (traditionalReceipt.status === 'success' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.success('Transaction successful!');
          onSuccess?.();
        } else if (traditionalReceipt.status === 'error' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.error(traditionalReceipt.error?.message || 'Transaction failed');
          onError?.(traditionalReceipt.error);
        }
      } else if (transactionType === 'accountAbstraction' && aaData) {
        if (aaCallStatus?.status === 'success' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.success('Transaction successful!');
          onSuccess?.();
        } else if (aaCallStatus?.isError && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.error('Transaction failed');
          onError?.(new Error('AA transaction failed'));
        }
      }
    };

    handleTransactionStatus();

    return () => {
      // Cleanup function
      hasHandledTransaction.current = false;
    };
  }, [transactionType, traditionalReceipt, aaData, aaCallStatus, hasGivenTxClosure, onSuccess, onError]);

  const executeTransaction = useCallback(async () => {
    hasHandledTransaction.current = false;
    setHasGivenTxClosure(false);
    setIsAwaitingWalletInteraction(true);
    setIsAwaitingTx(true);

    try {
      if (transactionType === 'traditional') {
        await writeTraditional(contractConfig, {
          onSettled: () => {
            setIsAwaitingWalletInteraction(false);
            onSettled?.();
          },
        });
      } else {
        await writeAA({
          contracts: [contractConfig],
          capabilities,
        }, {
          onSettled: () => {
            setIsAwaitingWalletInteraction(false);
            onSettled?.();
          },
        });
      }
    } catch (error) {
      setIsAwaitingTx(false);
      if(!hasGivenTxClosure) {
        setHasGivenTxClosure(true);
        toast.error((error as Error)?.message || 'Unable to complete transaction');
        onError?.(error);
      }
    } finally {
      setIsAwaitingWalletInteraction(false);
    }
  }, [transactionType, writeTraditional, writeAA, contractConfig, onError, onSettled, capabilities, hasGivenTxClosure]);

  return {
    executeTransaction,
    isAwaitingWalletInteraction,
    isAwaitingTx,
    isLoading: transactionType === 'traditional' ? isLoadingTraditional : isLoadingAA,
    txId: transactionType === 'traditional' ? null : txId,
    txHash: transactionType === 'traditional' ? traditionalData : null,
  };
}