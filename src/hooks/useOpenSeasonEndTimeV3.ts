import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

function useOpenSeasonEndTimeV3(
  stakingContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: openSeasonEndTime,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'openSeasonEndTime',
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: openSeasonEndTime as BigInt, isLoading};
}

export default useOpenSeasonEndTimeV3;