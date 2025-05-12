import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV3ABI from '../abi/PRONFTStakingV3ABI.json';

function usePropyKeyPROValueV3(
  stakingContractAddress: `0x${string}`,
  tokenAddress: string,
  tokenIds: number[],
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: proValue,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3ABI,
    functionName: 'getPROAmountToStakePk',
    args: [tokenAddress, tokenIds],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: proValue as BigInt, isLoading};
}

export default usePropyKeyPROValueV3;