import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';

function useStakedPROByStaker(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: stakerStakedPRO,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'stakerToStakedPRO',
    args: stakerAddress ? [stakerAddress] : ["0x0000000000000000000000000000000000000000"],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: stakerStakedPRO as BigInt, isLoading};
}

export default useStakedPROByStaker;