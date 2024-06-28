import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useReadContract } from 'wagmi';

function useTotalStakingShareSupply(
  stakingContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: totalStakingShareSupply,
    isLoading,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'totalSupply',
    args: [],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  return {data: totalStakingShareSupply as BigInt, isLoading};
}

export default useTotalStakingShareSupply;