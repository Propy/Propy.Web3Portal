import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCapabilities, useWriteContracts, useCallsStatus } from "wagmi/experimental";
// import { utils } from 'ethers';
import { toast } from 'sonner';

import { API_ENDPOINT } from "../utils/constants";

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
          url: `${API_ENDPOINT}/paymaster`,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);

  // Unified status effect
  useEffect(() => {
    console.log({transactionType, traditionalReceipt, aaData, aaCallStatus, hasGivenTxClosure, onSuccess, onError})
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
      } else if (transactionType === 'accountAbstraction' && aaData && aaCallStatus?.data?.receipts && (aaCallStatus?.data?.receipts?.length > 0)) {
        let containsErrorLog = false;
        // let errorMessage = false;
        for(let receipt of aaCallStatus?.data?.receipts) {
          for(let log of receipt.logs) {
            // UserOperationRevertReason (index_topic_1 bytes32 userOpHash, index_topic_2 address sender, uint256 nonce, bytes revertReason) = 0x1c4fada7374c0a9ee8841fc38afe82932dc0f8e69012e927f061a8bae611a201
            if(log.topics.indexOf("0x1c4fada7374c0a9ee8841fc38afe82932dc0f8e69012e927f061a8bae611a201") > -1) {
              containsErrorLog = true;
              // TODO decode log.data to get revertReason value probably using ABI
            }
          }
        }
        if ((aaCallStatus?.isError || containsErrorLog) && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.error('Transaction failed');
          onError?.(new Error('AA transaction failed'));
        } else if (aaCallStatus?.status === 'success' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.success('Transaction successful!');
          onSuccess?.();
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
    } catch (error: any) {
      setIsAwaitingTx(false);
      if(!hasGivenTxClosure) {
        setHasGivenTxClosure(true);
        toast.error((error as Error)?.message || error?.details || 'Unable to complete transaction, please try again or contact support.');
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