import coreABI from './PRONFTStakingV3CoreABI.json'
import registryABI from './PRONFTStakingV3ABI.json'
import lpModuleABI from './LPStakingModule.json'
import keyModuleABI from './PropyKeyStakingV3ModuleABI.json'
import erc20ModuleABI from './ERC20StakingV3ModuleABI.json'

function getErrorDefinitions(abi: any[]) {
  return abi.filter(item => item.type === 'error');
}

// Combine all error definitions
export const errorABI = [
  ...getErrorDefinitions(coreABI),
  ...getErrorDefinitions(lpModuleABI),
  ...getErrorDefinitions(keyModuleABI),
  ...getErrorDefinitions(erc20ModuleABI)
];

export const errorABIFull = [
  ...getErrorDefinitions(registryABI),
  ...getErrorDefinitions(coreABI),
  ...getErrorDefinitions(lpModuleABI),
  ...getErrorDefinitions(keyModuleABI),
  ...getErrorDefinitions(erc20ModuleABI)
];

const combinedABI = [
  ...registryABI,
  ...errorABI
]

export default combinedABI;