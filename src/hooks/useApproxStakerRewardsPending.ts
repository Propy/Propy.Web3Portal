import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV2ABI from '../abi/PRONFTStakingV2ABI.json';

function useApproxStakerRewardsPending(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: leaveAmount,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV2ABI,
    functionName: 'getApproxStakerRewardsPending',
    args: [stakerAddress],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: leaveAmount as BigInt, isLoading};
}

export default useApproxStakerRewardsPending;