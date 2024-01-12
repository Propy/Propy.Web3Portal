import L2OutputOracle from '../contract-abis/L2OutputOracle';
import { useContractRead } from 'wagmi';

export function useBlockNumberOfLatestL2OutputProposal(
  l2OutputOracleProxyAddress: `0x${string}`,
  l1ChainID: string,
) {
  const { data: blockNumberOfLatestL2OutputProposal } = useContractRead({
    address: l2OutputOracleProxyAddress,
    abi: L2OutputOracle,
    functionName: 'latestBlockNumber',
    chainId: parseInt(l1ChainID),
    watch: true,
  });

  return blockNumberOfLatestL2OutputProposal;
}
