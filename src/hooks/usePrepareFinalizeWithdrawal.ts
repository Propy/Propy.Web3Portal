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
) {
  const [withdrawalForTx, setWithdrawalForTx] = useState<WithdrawalMessage | null>(null);

  const { data: withdrawalReceipt } = useWaitForTransaction({
    hash: withdrawalTx,
    chainId: parseInt(l2ChainID),
  });

  const shouldPrepare = withdrawalForTx;

  const { config } = usePrepareContractWrite({
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
    if (withdrawalReceipt) {
      const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt);
      setWithdrawalForTx(withdrawalMessage);
    }
  }, [withdrawalReceipt]);

  return config;
}
