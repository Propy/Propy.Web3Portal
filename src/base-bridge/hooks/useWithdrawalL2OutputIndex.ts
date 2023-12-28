import L2OutputOracle from '../contract-abis/L2OutputOracle';
import { useContractRead } from 'wagmi';

export function useWithdrawalL2OutputIndex(
  blockNumber: bigint,
  l2OutputOracleAddress: `0x${string}`,
  l1ChainId?: string
) {
  const { data: withdrawalL2OutputIndex } = useContractRead({
    address: blockNumber ? l2OutputOracleAddress : undefined,
    abi: L2OutputOracle,
    functionName: 'getL2OutputIndexAfter',
    args: blockNumber ? [blockNumber] : undefined,
    chainId: l1ChainId ? parseInt(l1ChainId) : undefined,
  });

  return withdrawalL2OutputIndex;
}
