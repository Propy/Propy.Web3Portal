import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';

import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

import {
  STAKING_V3_PK_MODULE_ID,
  STAKING_V3_ERC20_MODULE_ID,
  STAKING_V3_LP_MODULE_ID,
} from '../utils/constants';

function useApproxStakerRewardsPendingByModuleV3(
  moduleId: typeof STAKING_V3_PK_MODULE_ID | typeof STAKING_V3_ERC20_MODULE_ID | typeof STAKING_V3_LP_MODULE_ID,
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
    abi: PRONFTStakingV3CoreABI,
    functionName: 'getApproxStakerRewardsPending',
    args: [stakerAddress, moduleId],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetch()
  }, [blockNumber, refetch])

  return {data: leaveAmount as BigInt, isLoading};
}

export default useApproxStakerRewardsPendingByModuleV3;