import ERC20ABI from '../abi/ERC20ABI.json';
import { useContractRead } from 'wagmi';

function useTotalStakingBalancePRO(
  stakingContractAddress?: `0x${string}`,
  proContractAddress?: `0x${string}`,
  chainId?: number
) {

  const { 
    data: totalStakingBalancePRO,
    isLoading,
  } = useContractRead({
    address: proContractAddress ? proContractAddress : undefined,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [stakingContractAddress],
    chainId: chainId ? chainId : undefined,
    watch: true,
  });

  return {data: totalStakingBalancePRO as BigInt, isLoading};
}

export default useTotalStakingBalancePRO;