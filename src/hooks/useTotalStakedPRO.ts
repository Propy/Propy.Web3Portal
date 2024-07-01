import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';

function useTotalStakedPRO(
  stakingContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: totalStakingBalancePRO,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'totalStakedPRO',
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: totalStakingBalancePRO as BigInt, isLoading};
}

export default useTotalStakedPRO;