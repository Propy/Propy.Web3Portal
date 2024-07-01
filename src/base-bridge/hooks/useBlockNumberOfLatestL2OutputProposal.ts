import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import L2OutputOracle from '../contract-abis/L2OutputOracle';

export function useBlockNumberOfLatestL2OutputProposal(
  l2OutputOracleProxyAddress: `0x${string}`,
  l1ChainID: string,
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: blockNumberOfLatestL2OutputProposal,
    refetch,
  } = useReadContract({
    address: l2OutputOracleProxyAddress,
    abi: L2OutputOracle,
    functionName: 'latestBlockNumber',
    chainId: parseInt(l1ChainID),
    // watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return blockNumberOfLatestL2OutputProposal;
}
