import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useCapabilities } from "wagmi/experimental";

import { API_ENDPOINT } from "../utils/constants";

type TransactionType = 'traditional' | 'accountAbstraction';

export function useWalletCapabilities() {

  const account = useAccount();

  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain &&
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

  const walletType : TransactionType = useMemo(() => capabilities?.paymasterService ? 'accountAbstraction' : 'traditional', [capabilities]);

  return {
    walletType,
    capabilities,
  };
}

export default useWalletCapabilities;