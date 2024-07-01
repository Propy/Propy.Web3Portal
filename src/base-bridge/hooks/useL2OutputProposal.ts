import L2OutputOracle from '../contract-abis/L2OutputOracle';
import { useReadContract } from 'wagmi';

export function useL2OutputProposal(
  withdrawalL2OutputIndex?: bigint,
  l2OutputOracleAddress?: `0x${string}`,
  l1ChainId?: string
) {
  const { data: l2OutputProposal } = useReadContract({
    address: withdrawalL2OutputIndex ? l2OutputOracleAddress : undefined,
    abi: L2OutputOracle,
    functionName: 'getL2Output',
    args: withdrawalL2OutputIndex ? [withdrawalL2OutputIndex] : undefined,
    chainId: l1ChainId ? parseInt(l1ChainId) : undefined,
  });

  return l2OutputProposal;
}
