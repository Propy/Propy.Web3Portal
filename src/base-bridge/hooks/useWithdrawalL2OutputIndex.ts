import L2OutputOracle from '../contract-abis/L2OutputOracle';
import { useReadContract } from 'wagmi';

export function useWithdrawalL2OutputIndex(
  blockNumber: bigint,
  l2OutputOracleAddress: `0x${string}`,
  l1ChainId?: string
) {
  const { data: withdrawalL2OutputIndex } = useReadContract({
    address: blockNumber ? l2OutputOracleAddress : undefined,
    abi: L2OutputOracle,
    functionName: 'getL2OutputIndexAfter',
    args: blockNumber ? [blockNumber] : undefined,
    chainId: l1ChainId ? parseInt(l1ChainId) : undefined,
  });

  return withdrawalL2OutputIndex;
}
