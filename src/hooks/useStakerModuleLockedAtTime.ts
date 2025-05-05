import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

function useStakerModuleLockedAtTime(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number,
  moduleId?: string,
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: stakerLockedAt,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'lockedAt',
    args: (stakerAddress && moduleId) ? [stakerAddress, moduleId] : ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: stakerLockedAt as number, isLoading};
}

export default useStakerModuleLockedAtTime;