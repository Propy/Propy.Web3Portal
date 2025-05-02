import coreABI from './PRONFTStakingV3CoreABI.json'
import registryABI from './PRONFTStakingV3ABI.json'
import lpModuleABI from './LPStakingModule.json'
import keyModuleABI from './PropyKeyStakingV3ModuleABI.json'
import erc20ModuleABI from './ERC20StakingV3ModuleABI.json'

const StakingV3CombinedABI = [
  ...lpModuleABI,
  ...registryABI,
  ...coreABI,
  ...keyModuleABI,
  ...erc20ModuleABI
];

export default StakingV3CombinedABI;