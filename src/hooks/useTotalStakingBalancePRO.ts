import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import ERC20ABI from '../abi/ERC20ABI.json';

function useTotalStakingBalancePRO(
  stakingContractAddress?: `0x${string}`,
  proContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: totalStakingBalancePRO,
    isLoading,
    refetch,
  } = useReadContract({
    address: proContractAddress ? proContractAddress : undefined,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [stakingContractAddress],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: totalStakingBalancePRO as BigInt, isLoading};
}

export default useTotalStakingBalancePRO;