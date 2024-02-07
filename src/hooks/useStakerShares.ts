import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useContractRead } from 'wagmi';

function useStakerShares(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: stakerShares,
    isLoading,
  } = useContractRead({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'stakerToTotalShares',
    args: stakerAddress ? [stakerAddress] : ["0x0000000000000000000000000000000000000000"],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: stakerShares as BigInt, isLoading};
}

export default useStakerShares;