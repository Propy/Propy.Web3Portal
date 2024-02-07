import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useContractRead } from 'wagmi';

function useLeaveAmountFromShareAmount(
  stakingContractAddress?: `0x${string}`,
  shareAmount?: BigInt,
  chainId?: number
) {

  const { 
    data: leaveAmount,
    isLoading,
  } = useContractRead({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'getApproxLeaveAmountFromShareAmount',
    args: [shareAmount ? shareAmount?.toString() : 0],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: leaveAmount as BigInt, isLoading};
}

export default useLeaveAmountFromShareAmount;