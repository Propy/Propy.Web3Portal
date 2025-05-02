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

function useStakerSharesV3(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { 
    data: stakerSharesPropyKeys,
    isLoading: isLoadingPropyKeys,
    refetch: refetchPropyKeys,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToTotalShares',
    args: stakerAddress ? [stakerAddress, STAKING_V3_PK_MODULE_ID] : ["0x0000000000000000000000000000000000000000", STAKING_V3_PK_MODULE_ID],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  const { 
    data: stakerSharesPRO,
    isLoading: isLoadingPRO,
    refetch: refetchPRO,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToTotalShares',
    args: stakerAddress ? [stakerAddress, STAKING_V3_ERC20_MODULE_ID] : ["0x0000000000000000000000000000000000000000", STAKING_V3_ERC20_MODULE_ID],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  const { 
    data: stakerSharesLP,
    isLoading: isLoadingLP,
    refetch: refetchLP,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToTotalShares',
    args: stakerAddress ? [stakerAddress, STAKING_V3_LP_MODULE_ID] : ["0x0000000000000000000000000000000000000000", STAKING_V3_LP_MODULE_ID],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  useEffect(() => {
    refetchLP();
    refetchPRO();
    refetchPropyKeys();
  }, [blockNumber, refetchLP, refetchPRO, refetchPropyKeys])

  // Safely calculate the total by checking for undefined values
  const calculateTotal = (): bigint => {
    // Check for null or undefined values
    const lpValue = stakerSharesLP != null ? BigInt(stakerSharesLP.toString()) : BigInt(0);
    const proValue = stakerSharesPRO != null ? BigInt(stakerSharesPRO.toString()) : BigInt(0);
    const pkValue = stakerSharesPropyKeys != null ? BigInt(stakerSharesPropyKeys.toString()) : BigInt(0);
    
    return lpValue + proValue + pkValue;
  };

  return {
    data: {
      stakerSharesLP: stakerSharesLP as BigInt,
      stakerSharesPRO: stakerSharesPRO as BigInt,
      stakerSharesPropyKeys: stakerSharesPropyKeys as BigInt,
      stakerSharesTotal: calculateTotal(),
    }, 
    isLoading: isLoadingLP || isLoadingPRO || isLoadingPropyKeys
  };
}

export default useStakerSharesV3;