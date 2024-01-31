import { useEffect, useState } from 'react';
import OptimismPortal from '../base-bridge/contract-abis/OptimismPortal';
import { WithdrawalMessage } from '../base-bridge/types/WithdrawalMessage';
import { getWithdrawalMessage } from '../base-bridge/transactions/getWithdrawalMessage';
import { usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

export function usePrepareFinalizeWithdrawal(
  withdrawalTx: `0x${string}`,
  l2ChainID: string,
  l1ChainID: string,
  l1OptimismPortalProxyAddress: `0x${string}`,
  prepErrorHandler: (isPrepError: boolean) => void,
  alreadyFinalizedHandler: (isWithdrawalAlreadyFinalized: boolean) => void,
  finalizationPeriodHasNotElapsed: (finalizePeriodNotElapsed: boolean) => void,
  refetchOnChallengePeriodIndex: number,
) {
  const [withdrawalForTx, setWithdrawalForTx] = useState<WithdrawalMessage | null>(null);
  const [lastRefetchOnChallengePeriodIndex, setLastRefetchOnChallengePeriodIndex] = useState(refetchOnChallengePeriodIndex);

  const { data: withdrawalReceipt } = useWaitForTransaction({
    hash: withdrawalTx,
    chainId: parseInt(l2ChainID),
  });

  const shouldPrepare = withdrawalForTx;

  const { config, error: usePrepareContractWriteError, refetch } = usePrepareContractWrite({
    address: shouldPrepare ? l1OptimismPortalProxyAddress : undefined,
    abi: OptimismPortal,
    functionName: 'finalizeWithdrawalTransaction',
    chainId: parseInt(l1ChainID),
    args: shouldPrepare
      ? [
          {
            nonce: withdrawalForTx.nonce,
            sender: withdrawalForTx.sender,
            target: withdrawalForTx.target,
            value: withdrawalForTx.value,
            gasLimit: withdrawalForTx.gasLimit,
            data: withdrawalForTx.data,
          },
        ]
      : undefined,
    dataSuffix: undefined,
  });

  useEffect(() => {
    if(
      //@ts-ignore
      usePrepareContractWriteError?.cause?.reason?.indexOf("proven withdrawal finalization period has not elapsed") &&
      (refetchOnChallengePeriodIndex !== lastRefetchOnChallengePeriodIndex)
    ) {
      refetch();
      setLastRefetchOnChallengePeriodIndex(refetchOnChallengePeriodIndex);
    }
  }, [refetchOnChallengePeriodIndex, refetch, usePrepareContractWriteError, lastRefetchOnChallengePeriodIndex])

  useEffect(() => {
    console.log({usePrepareContractWriteError})
    if(usePrepareContractWriteError) {
      //@ts-ignore
      if(usePrepareContractWriteError?.cause?.reason?.indexOf("withdrawal has already been finalized") > -1) {
        alreadyFinalizedHandler(true);
        prepErrorHandler(false);
        finalizationPeriodHasNotElapsed(false);
        //@ts-ignore
      } else if(usePrepareContractWriteError?.cause?.reason?.indexOf("proven withdrawal finalization period has not elapsed")) {
        prepErrorHandler(true);
        alreadyFinalizedHandler(false);
        finalizationPeriodHasNotElapsed(true);
      } else {
        alreadyFinalizedHandler(false);
        finalizationPeriodHasNotElapsed(false);
        prepErrorHandler(true);
      }
    } else {
      alreadyFinalizedHandler(false);
      prepErrorHandler(false);
      finalizationPeriodHasNotElapsed(false);
    }
  }, [usePrepareContractWriteError, prepErrorHandler, alreadyFinalizedHandler, finalizationPeriodHasNotElapsed])

  useEffect(() => {
    if (withdrawalReceipt) {
      const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt);
      setWithdrawalForTx(withdrawalMessage);
    }
  }, [withdrawalReceipt]);

  return config;
}
