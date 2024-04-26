import {
  SupportedNetworks,
} from '../interfaces';

export const STAKING_CONTRACT = '0x00000000219ab540356cBB839Cbe05303d7705Fa'

export const ENV_TO_API_ENDPOINT : {[key: string]: string} = {
  "local": "http://localhost:8420",
  "dev": "https://dev.dappapi.propy.com/",
  "prod": "https://dappapi.propy.com/",
}

// export const API_ENDPOINT = "http://localhost:8420";
// export const API_ENDPOINT = "https://dev.dappapi.propy.com/";
export const API_ENDPOINT = (process?.env?.REACT_APP_ENV && ENV_TO_API_ENDPOINT[process.env.REACT_APP_ENV]) ? ENV_TO_API_ENDPOINT[process.env.REACT_APP_ENV] : 'https://dev.dappapi.propy.com/' ;

export const PRO_TOKEN_ADDRESS = "0x226bb599a12C826476e3A771454697EA52E9E220";
export const PRO_TOKEN_DECIMALS = 8;

export const TOKEN_NAME_PREFIX : {[key: string]: string} = {
  "0xB5c4910335D373eb26FeBb30B8f1d7416179A4EC": "MetaAgent",
}

export const TOKEN_NAME_HIDE_ID : {[key: string]: boolean} = {
  "0x37f6091feF42eFD50d4F07a91c955606e8dE38c2": true,
  "0x8fbFe4036F13e8E42E51235C9adA6efD2ACF6A95": true,
  "0x73C3a1437B0307732Eb086cb2032552eBea15444": true,
  "0xB5c4910335D373eb26FeBb30B8f1d7416179A4EC": true,
  "0x567c407D054A644DBBBf2d3a6643776473f82d7a": true,
  "0x77932CA68a539a738d167Ec019B6aE7596766152": true,
  "0xa239b9b3E00637F29f6c7C416ac95127290b950E": true,
  "0x45C395851c9BfBd3b7313B35E6Ee460D461d585c": true,
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const PROPY_LIGHT_GREY = "#f6f6f6";

export const PROPY_LIGHT_BLUE = "#38A6FB";

export const VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES = ["propykeys", "0xa239b9b3E00637F29f6c7C416ac95127290b950E", "propy-home-nft-dev-base-testnet", "0x45C395851c9BfBd3b7313B35E6Ee460D461d585c"];

const COLLECTIONS_ENTRIES_DEV = [
  {
    network: "base-sepolia",
    address: "0x07922CDe9e58fb590ffB59BB8777cF4b737fE2a3",
    slug: "propykeys-staking-sepolia"
  },
  {
    network: "base-sepolia",
    address: "0x4ebCEb82B5940E10c301A33261Af13222A38d974",
    slug: "propykeys-og-staking-sepolia",
  },
  {
    network: "base-sepolia",
    address: "0x45C395851c9BfBd3b7313B35E6Ee460D461d585c",
    slug: "propy-home-nft-dev-base-testnet",
  },
  {
    network: "goerli",
    address: "0x8fbFe4036F13e8E42E51235C9adA6efD2ACF6A95",
    slug: "propy-deed-certificates-stage-testnet",
  },
  {
    network: "goerli",
    address: "0x73C3a1437B0307732Eb086cb2032552eBea15444",
    slug: "propy-deed-certificates-dev-testnet",
  },
]

const COLLECTIONS_ENTRIES_PROD = [
  {
    network: "base",
    address: "0xa239b9b3E00637F29f6c7C416ac95127290b950E",
    slug: "propykeys?landmark=true",
    overrideTitle: "PropyKeys Landmarks",
    filterShims: ["landmark"],
  },
  {
    network: "base",
    address: "0xa239b9b3E00637F29f6c7C416ac95127290b950E",
    slug: "propykeys",
  },
  {
    network: "ethereum",
    address: "0x2dbC375B35c5A2B6E36A386c8006168b686b70D3",
    slug: "propy-real-world-assets",
  },
  {
    network: "arbitrum",
    address: "0x567c407D054A644DBBBf2d3a6643776473f82d7a",
    slug: "propy-deed-certificates",
  },
  {
    network: "ethereum",
    address: "0xB5c4910335D373eb26FeBb30B8f1d7416179A4EC",
    slug: "meta-agents",
  },
]

export const MINT_AN_ADDRESS_NFT_ADDRESSES = ["0x45C395851c9BfBd3b7313B35E6Ee460D461d585c", "0xa239b9b3E00637F29f6c7C416ac95127290b950E"];

export const MINT_AN_ADDRESS_LINK = process?.env?.REACT_APP_ENV === 'prod' ? 'https://propykeys.com' : 'https://stage.pk.propy.com';

export const NETWORK_ID_TO_NAME : {[key: number]: string | undefined} = {
	1: 'ethereum',
	42161: 'arbitrum',
  8453: 'base',
  ...(process?.env?.REACT_APP_ENV !== 'prod' && {
    84532: 'base-sepolia',
    84531: 'base-goerli',
    5: 'goerli',
    11155111: 'sepolia',
  })
}

// REACT_APP_QUICKNODE_RPC_URL_MAINNET="https://fittest-cosmological-grass.quiknode.pro/9cf41930fbbefb9874249ef10b64e4f311847524/"
// REACT_APP_QUICKNODE_RPC_URL_ARBITRUM="https://methodical-cosmological-county.arbitrum-mainnet.quiknode.pro/0338e1b5f17fa07a19974e2943651afe27114da1/"
// REACT_APP_QUICKNODE_RPC_URL_BASE="https://black-stylish-film.base-mainnet.quiknode.pro/485c59e4fe0210ea66a56ad320b0cd7de255a93b/"
// REACT_APP_QUICKNODE_RPC_URL_SEPOLIA="https://wandering-light-lambo.ethereum-sepolia.quiknode.pro/619fe77ab58eeca41650532e19818572938ec8f7"
// REACT_APP_QUICKNODE_RPC_URL_BASE_SEPOLIA="https://bold-ancient-card.base-sepolia.quiknode.pro/be656259bcf0f5ca0de9302aa1b5c09be5a428a5"

export const NETWORK_ID_TO_RPC : {[key: number]: string | undefined} = {
  1: process.env.REACT_APP_QUICKNODE_RPC_URL_MAINNET ? process.env.REACT_APP_QUICKNODE_RPC_URL_MAINNET : "",
  42161: process.env.REACT_APP_QUICKNODE_RPC_URL_ARBITRUM ? process.env.REACT_APP_QUICKNODE_RPC_URL_ARBITRUM : "",
  8453: process.env.REACT_APP_QUICKNODE_RPC_URL_BASE ? process.env.REACT_APP_QUICKNODE_RPC_URL_BASE : "",
  ...(process?.env?.REACT_APP_ENV !== 'prod' && {
    84532: process.env.REACT_APP_QUICKNODE_RPC_URL_BASE_SEPOLIA ? process.env.REACT_APP_QUICKNODE_RPC_URL_BASE_SEPOLIA : "",
    11155111: process.env.REACT_APP_QUICKNODE_RPC_URL_SEPOLIA ? process.env.REACT_APP_QUICKNODE_RPC_URL_SEPOLIA : "",
  })
}

export const NETWORK_NAME_TO_DISPLAY_NAME : {[key: string]: string} = {
	'ethereum': 'Ethereum',
	'arbitrum': 'Arbitrum',
  'base': 'Base',
  ...(process?.env?.REACT_APP_ENV !== 'prod' && {
    'base-sepolia': 'Base Sepolia',
    'base-goerli': 'Base Goerli',
    'goerli': "Goerli",
    'sepolia': 'Sepolia'
  })
}

export const NETWORK_NAME_TO_ID : {[key: string]: number} = {
	'ethereum': 1,
	'arbitrum': 42161,
  'base': 8453,
  ...(process?.env?.REACT_APP_ENV !== 'prod' && {
    'base-sepolia': 84532,
    'base-goerli': 84531,
    'goerli': 5,
    'sepolia': 11155111,
  })
}

export const VALID_BRIDGE_SELECTIONS = ['ethereum-to-base', 'base-to-ethereum'];
export const BRIDGE_SELECTION_TO_REQUIRED_NETWORK : {[key: string]: SupportedNetworks} = {
  'ethereum-to-base': process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
  'base-to-ethereum': process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia',
}
export const BRIDGE_SELECTION_TO_TRANSACTION_ACTION_TO_REQUIRED_NETWORK : {
  [key: string]: {
    [key: string]: SupportedNetworks
  }
} = {
  'base-to-ethereum': {
    'prove-withdrawal': process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
    'finalize-withdrawal': process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
  },
}
export const ETH_L1_NETWORK = process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia';
export const BASE_BRIDGE_L2_NETWORKS = ['base', 'base-sepolia'];
export const BASE_BRIDGE_L1_NETWORK = process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia';
export const BASE_BRIDGE_L2_NETWORK = process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia';
export const ETHEREUM_TO_BASE_BRIDGE = process?.env?.REACT_APP_ENV === 'prod' ? "0x3154Cf16ccdb4C6d922629664174b904d80F2C35" : "0xfd0Bf71F60660E2f608ed56e1659C450eB113120";
export const BASE_TO_ETHEREUM_BRIDGE = process?.env?.REACT_APP_ENV === 'prod' ? "0x4200000000000000000000000000000000000010" : "0x4200000000000000000000000000000000000010";
export const PRO_ETHEREUM_L1_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x226bb599a12C826476e3A771454697EA52E9E220" : "0xa7423583D3b0B292E093aAC2f8900396EC110960"; // sepolia
export const PRO_BASE_L2_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x18dD5B087bCA9920562aFf7A0199b96B9230438b" : "0x3660925E58444955c4812e42A572e532e69Dac7B"; // base sepolia
export const L2_TO_L1_MESSAGE_PASSER_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x4200000000000000000000000000000000000016" : "0x4200000000000000000000000000000000000016";
export const OPTIMISM_PORTAL_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e" : "0x49f53e41452C74589E85cA1677426Ba426459e85";
export const L2_OUTPUT_ORACLE = process?.env?.REACT_APP_ENV === 'prod' ? "0x56315b90c40730925ec5485cf004d835058518A0" : "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254";
export const BASE_L2_NETWORK = process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia';
export const BASE_PROPYKEYS_STAKING_CONTRACT_V1 = process?.env?.REACT_APP_ENV === 'prod' ? "0xcFEc6c0F4eCd951ecac87e2Ab5BE22449c9faf8B" : "0x89b36952ad798fFDE2CBe825ade5ed94f2d53905";
export const BASE_PROPYKEYS_STAKING_CONTRACT_V2 = process?.env?.REACT_APP_ENV === 'prod' ? "0x" : "0x74aa08EeE3a819D18B580a57F7B37a9dfb07730D";
export const BASE_PROPYKEYS_STAKING_NFT = process?.env?.REACT_APP_ENV === 'prod' ? "0xa239b9b3E00637F29f6c7C416ac95127290b950E" : "0x07922CDe9e58fb590ffB59BB8777cF4b737fE2a3";
export const BASE_PROPYKEYS_NFT = process?.env?.REACT_APP_ENV === 'prod' ? "0xa239b9b3E00637F29f6c7C416ac95127290b950E" : "0x45C395851c9BfBd3b7313B35E6Ee460D461d585c";
export const BASE_OG_STAKING_NFT = process?.env?.REACT_APP_ENV === 'prod' ? "0xc84F3b80847B224684b11bF956d46c7028bC1906" : "0x4ebCEb82B5940E10c301A33261Af13222A38d974";
export const PROPY_KEY_REPOSSESSION_CONTRACT = process?.env?.REACT_APP_ENV === 'prod' ? "0x" : "0x156904cC4E9999cBA3Fb41875056C288fbC53B9F"; // "0x156904cC4E9999cBA3Fb41875056C288fbC53B9F" for using the default testnet propykeys, "0xb7EC51CA03d0774e7B83595CD8653E67fB7778ab" for staking testnet propykeys
// export const PROPY_KEY_REPOSSESSION_CONTRACT = process?.env?.REACT_APP_ENV === 'prod' ? "0x" : "0xb7EC51CA03d0774e7B83595CD8653E67fB7778ab"

export const BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK : {[key: string]: {
  bridgeAddress: `0x${string}`,
  origin: SupportedNetworks,
  destination: SupportedNetworks,
  originAssetAddress: `0x${string}`,
  originAssetDecimals: number,
  destinationAssetAddress: `0x${string}`
  destinationAssetDecimals: number,
}} = {
  'ethereum-to-base': {
    bridgeAddress: ETHEREUM_TO_BASE_BRIDGE,
    origin: process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
    destination: process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia',
    // origin: 'goerli', // temp goerli testing
    // destination: 'base-goerli', // temp goerli testing
    originAssetAddress: PRO_ETHEREUM_L1_ADDRESS,
    originAssetDecimals: 8,
    destinationAssetAddress: PRO_BASE_L2_ADDRESS,
    destinationAssetDecimals: 8,
  },
  'base-to-ethereum': {
    bridgeAddress: BASE_TO_ETHEREUM_BRIDGE,
    origin: process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia',
    destination: process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
    // origin: 'base-goerli', // temp goerli testing
    // destination: 'goerli', // temp goerli testing
    originAssetAddress: PRO_BASE_L2_ADDRESS,
    originAssetDecimals: 8,
    destinationAssetAddress: PRO_ETHEREUM_L1_ADDRESS,
    destinationAssetDecimals: 8,
  },
}

export const IS_GLOBAL_TOP_BANNER_ENABLED = true;
export const GLOBAL_TOP_BANNER_HEIGHT = 28;
export const GLOBAL_PAGE_HEIGHT = IS_GLOBAL_TOP_BANNER_ENABLED ? `calc(100vh - ${64 + GLOBAL_TOP_BANNER_HEIGHT}px)` : 'calc(100vh - 64px)';

interface ICollectionEntry {
  network: string;
  address: string;
  slug: string;
  overrideTitle?: string;
  filterShims?: string[];
}

export const COLLECTIONS_PAGE_ENTRIES : ICollectionEntry[] = process?.env?.REACT_APP_ENV === 'prod' ? COLLECTIONS_ENTRIES_PROD : [...COLLECTIONS_ENTRIES_DEV, ...COLLECTIONS_ENTRIES_PROD];

export const STAKING_ORIGIN_COUNTRY_BLACKLIST = ["US", "ZA"];