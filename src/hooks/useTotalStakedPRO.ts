import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useReadContract } from 'wagmi';

function useTotalStakedPRO(
  stakingContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: totalStakingBalancePRO,
    isLoading,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'totalStakedPRO',
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  return {data: totalStakingBalancePRO as BigInt, isLoading};
}

export default useTotalStakedPRO;