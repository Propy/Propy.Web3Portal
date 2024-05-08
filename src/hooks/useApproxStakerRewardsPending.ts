import PRONFTStakingV2ABI from '../abi/PRONFTStakingV2ABI.json';
import { useContractRead } from 'wagmi';

function useApproxStakerRewardsPending(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: leaveAmount,
    isLoading,
  } = useContractRead({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingV2ABI,
    functionName: 'getApproxStakerRewardsPending',
    args: [stakerAddress],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: leaveAmount as BigInt, isLoading};
}

export default useApproxStakerRewardsPending;