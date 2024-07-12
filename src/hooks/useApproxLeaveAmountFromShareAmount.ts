import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';

function useLeaveAmountFromShareAmount(
  stakingContractAddress?: `0x${string}`,
  shareAmount?: BigInt,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: leaveAmount,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'getApproxLeaveAmountFromShareAmount',
    args: [shareAmount ? shareAmount?.toString() : 0],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: leaveAmount as BigInt, isLoading};
}

export default useLeaveAmountFromShareAmount;