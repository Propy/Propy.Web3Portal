import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';

function useStakedTokenCount(
  stakingContractAddress?: `0x${string}`,
  tokenAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: totalStakingShareSupply,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'tokenAddressToStakedTokenCount',
    args: [tokenAddress],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: totalStakingShareSupply as BigInt, isLoading};
}

export default useStakedTokenCount;