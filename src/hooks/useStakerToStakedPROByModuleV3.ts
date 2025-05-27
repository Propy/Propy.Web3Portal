import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

import {
  STAKING_V3_ERC20_MODULE_ID,
} from '../utils/constants';

function useStakerToStakedPROByModuleV3(
  moduleId: typeof STAKING_V3_ERC20_MODULE_ID,
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: stakedPRO,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToStakedPRO',
    args: [stakerAddress, moduleId],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: stakedPRO as BigInt, isLoading};
}

export default useStakerToStakedPROByModuleV3;