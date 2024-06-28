import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useReadContract } from 'wagmi';

function useStakedPROByStaker(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: stakerStakedPRO,
    isLoading,
  } = useReadContract({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'stakerToStakedPRO',
    args: stakerAddress ? [stakerAddress] : ["0x0000000000000000000000000000000000000000"],
    chainId: chainId ? chainId : undefined,
    //watch: true,
  });

  return {data: stakerStakedPRO as BigInt, isLoading};
}

export default useStakedPROByStaker;