import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';
import { useContractRead } from 'wagmi';

function useStakerUnlockTime(
  stakingContractAddress?: `0x${string}`,
  stakerAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: stakerLocked,
    isLoading,
  } = useContractRead({
    address: stakingContractAddress ? stakingContractAddress : undefined,
    abi: PRONFTStakingABI,
    functionName: 'locked',
    args: stakerAddress ? [stakerAddress] : ["0x0000000000000000000000000000000000000000"],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: stakerLocked as number, isLoading};
}

export default useStakerUnlockTime;