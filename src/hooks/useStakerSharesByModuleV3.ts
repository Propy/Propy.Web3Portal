import { useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';
import BigNumber from 'bignumber.js';

import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

import {
  STAKING_V3_PK_MODULE_ID,
  STAKING_V3_ERC20_MODULE_ID,
  STAKING_V3_LP_MODULE_ID,
} from '../utils/constants';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

function useStakerSharesByModuleV3(
  moduleId: typeof STAKING_V3_PK_MODULE_ID | typeof STAKING_V3_ERC20_MODULE_ID | typeof STAKING_V3_LP_MODULE_ID,
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: moduleShares,
    isLoading: isLoadingModuleShares,
    refetch: refetchModuleShares,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToTotalShares',
    args: stakerAddress ? [stakerAddress, moduleId] : ["0x0000000000000000000000000000000000000000", moduleId],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetchModuleShares();
  }, [blockNumber, refetchModuleShares])

  return {
    data: moduleShares as BigInt, 
    isLoading: isLoadingModuleShares
  };
}

export default useStakerSharesByModuleV3;