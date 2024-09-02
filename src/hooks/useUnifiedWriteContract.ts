import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCapabilities, useWriteContracts, useCallsStatus } from "wagmi/experimental";
import { utils } from 'ethers';
import { toast } from 'sonner';

import { API_ENDPOINT } from "../utils/constants";

import EntryPointV06ABI from "../abi/EntryPointV06ABI.json";

import {
  toChecksumAddress,
} from '../utils'

type TransactionType = 'traditional' | 'accountAbstraction';

const EntryPointV06Interface = new utils.Interface(EntryPointV06ABI);

const EntryPointV06Addresses = ["0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"];

interface UseUnifiedTransactionProps {
  contractConfig?: any; // TODO improve type
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
  successToastMessage?: string;
  fallbackErrorMessage?: string;
}

export function useUnifiedWriteContract({
  contractConfig,
  onSuccess,
  onError,
  onSettled,
  successToastMessage,
  fallbackErrorMessage,
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

  const transactionType : TransactionType = useMemo(() => capabilities?.paymasterService ? 'accountAbstraction' : 'traditional', [capabilities]);

  // Unified status effect
  useEffect(() => {
    // console.log({transactionType, traditionalReceipt, aaData, aaCallStatus, hasGivenTxClosure, onSuccess, onError})
    if(aaCallStatus?.isStale && aaData) {
      aaCallStatus.refetch();
    }
    if (hasHandledTransaction.current) return;

    const handleTransactionStatus = () => {
      if (transactionType === 'traditional' && traditionalReceipt) {
        if (traditionalReceipt.status === 'success' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.success(successToastMessage ? successToastMessage : 'Transaction successful!');
          onSuccess?.();
        } else if (traditionalReceipt.status === 'error' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          if(!onError) {
            toast.error(traditionalReceipt.error?.message || fallbackErrorMessage || 'Transaction failed');
          } else {
            onError?.(traditionalReceipt.error);
          }
        }
      } else if (transactionType === 'accountAbstraction' && aaData && aaCallStatus?.data?.receipts && (aaCallStatus?.data?.receipts?.length > 0)) {
        let containsErrorLog = false;
        let errorMessage = false;
        for(let receipt of aaCallStatus?.data?.receipts) {
          for(let log of receipt.logs) {
            if(EntryPointV06Addresses.indexOf(toChecksumAddress(log.address)) > -1) {
              let parsedLog = EntryPointV06Interface.parseLog(log);
              // UserOperationRevertReason (index_topic_1 bytes32 userOpHash, index_topic_2 address sender, uint256 nonce, bytes revertReason)
              // 0x1c4fada7374c0a9ee8841fc38afe82932dc0f8e69012e927f061a8bae611a201
              if(parsedLog.name === "UserOperationRevertReason") {
                const decodedReasonArray = utils.defaultAbiCoder.decode(
                    ['string'],
                    utils.hexDataSlice(parsedLog.args.revertReason, 4)
                )
                if(decodedReasonArray[0]) {
                  errorMessage = decodedReasonArray[0];
                }
                containsErrorLog = true;
              }
            }
          }
        }
        if ((aaCallStatus?.isError || containsErrorLog) && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          if(!onError) {
            toast.error(`Transaction failed${errorMessage ? ` with reason: ${errorMessage}` : ""}`);
          } else {
            onError?.(new Error(`Transaction failed${errorMessage ? ` with reason: ${errorMessage}` : ""}`));
          }
        } else if (aaCallStatus?.status === 'success' && !hasGivenTxClosure) {
          hasHandledTransaction.current = true;
          setIsAwaitingTx(false);
          setHasGivenTxClosure(true);
          toast.success(successToastMessage ? successToastMessage : 'Transaction successful!');
          onSuccess?.();
        }
      }
    };

    handleTransactionStatus();

    return () => {
      // Cleanup function
      hasHandledTransaction.current = false;
    };
  }, [transactionType, traditionalReceipt, aaData, aaCallStatus, hasGivenTxClosure, onSuccess, onError, successToastMessage, fallbackErrorMessage]);

  const executeTransaction = useCallback(async (overrideContractConfig: any = false) => {
    hasHandledTransaction.current = false;
    setHasGivenTxClosure(false);
    setIsAwaitingWalletInteraction(true);
    setIsAwaitingTx(true);

    let useContractConfig = overrideContractConfig || contractConfig;

    try {
      if (transactionType === 'traditional') {
        await writeTraditional(useContractConfig, {
          onSettled: () => {
            setIsAwaitingWalletInteraction(false);
            onSettled?.();
          },
        });
      } else {
        await writeAA({
          contracts: [useContractConfig],
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
        if(!onError) {
          toast.error((error as Error)?.message || error?.details || 'Unable to complete transaction, please try again or contact support.');
        } else {
          onError?.(error);
        }
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

export default useUnifiedWriteContract;