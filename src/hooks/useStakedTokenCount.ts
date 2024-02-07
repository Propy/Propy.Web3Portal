import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useContractRead } from 'wagmi';

function useStakedTokenCount(
  stakingContractAddress?: `0x${string}`,
  tokenAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: totalStakingShareSupply,
    isLoading,
  } = useContractRead({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'tokenAddressToStakedTokenCount',
    args: [tokenAddress],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: totalStakingShareSupply as BigInt, isLoading};
}

export default useStakedTokenCount;