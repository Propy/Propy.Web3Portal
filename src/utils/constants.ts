import {
  SupportedNetworks,
} from '../interfaces';

export const STAKING_CONTRACT = '0x00000000219ab540356cBB839Cbe05303d7705Fa'

// export const API_ENDPOINT = "http://localhost:8420";

export const ENV_TO_API_ENDPOINT : {[key: string]: string} = {
  "local": "http://localhost:8420",
  "dev": "https://dev.dappapi.propy.com/",
  "prod": "https://dappapi.propy.com/",
}

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

const COLLECTIONS_ENTRIES_DEV = [
  {
    network: "base-sepolia",
    address: "0x45C395851c9BfBd3b7313B35E6Ee460D461d585c",
    slug: "propy-home-nft-dev-testnet",
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

export const BRIDGE_SELECTION_TO_REQUIRED_NETWORK : {[key: string]: SupportedNetworks} = {
  'ethereum-to-base': process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
  'base-to-ethereum': process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia',
  // 'ethereum-to-base': process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia', // temp goerli testing
  // 'base-to-ethereum': process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-goerli', // temp goerli testing
}

export const ETHEREUM_TO_BASE_BRIDGE = process?.env?.REACT_APP_ENV === 'prod' ? "0x3154Cf16ccdb4C6d922629664174b904d80F2C35" : "0xfd0Bf71F60660E2f608ed56e1659C450eB113120";
export const BASE_TO_ETHEREUM_BRIDGE = process?.env?.REACT_APP_ENV === 'prod' ? "0x4200000000000000000000000000000000000010" : "0x4200000000000000000000000000000000000010";
export const PRO_ETHEREUM_L1_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x" : "0xa7423583D3b0B292E093aAC2f8900396EC110960"; // base sepolia
export const PRO_BASE_L2_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x" : "0x15269C6bDfe0bD1A107e1eEcF3200664D40bc042"; // base sepolia
export const L2_TO_L1_MESSAGE_PASSER_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x4200000000000000000000000000000000000016" : "0x4200000000000000000000000000000000000016";
export const OPTIMISM_PORTAL_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e" : "0x49f53e41452C74589E85cA1677426Ba426459e85";
export const L2_OUTPUT_ORACLE = process?.env?.REACT_APP_ENV === 'prod' ? "0x56315b90c40730925ec5485cf004d835058518A0" : "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254";

// export const OPTIMISM_PORTAL_ADDRESS = "0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA"; // base goerli temp goerli testing
// export const L2_TO_L1_MESSAGE_PASSER_ADDRESS = "0x4200000000000000000000000000000000000016"; // base goerli temp goerli testing
// export const ETHEREUM_TO_BASE_BRIDGE = "0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a"; // base goerli temp goerli testing
// export const PRO_ETHEREUM_L1_ADDRESS = "0x008941C54D77EF9ba3DA3F873571F1C9F89Ea58d"; // base goerli temp goerli testing
// export const PRO_BASE_L2_ADDRESS = "0x0D760ee479401Bb4C40BDB7604b329FfF411b3f2"; // base goerli temp goerli testing
// export const L2_OUTPUT_ORACLE = "0x2A35891ff30313CcFa6CE88dcf3858bb075A2298"; // base goerli temp goerli testing

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
    destinationAssetDecimals: 18,
  },
  'base-to-ethereum': {
    bridgeAddress: BASE_TO_ETHEREUM_BRIDGE,
    origin: process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia',
    destination: process?.env?.REACT_APP_ENV === 'prod' ? 'ethereum' : 'sepolia',
    // origin: 'base-goerli', // temp goerli testing
    // destination: 'goerli', // temp goerli testing
    originAssetAddress: PRO_BASE_L2_ADDRESS,
    originAssetDecimals: 18,
    destinationAssetAddress: PRO_ETHEREUM_L1_ADDRESS,
    destinationAssetDecimals: 8,
  },
}

export const IS_GLOBAL_TOP_BANNER_ENABLED = true;
export const GLOBAL_TOP_BANNER_HEIGHT = 28;
export const GLOBAL_PAGE_HEIGHT = IS_GLOBAL_TOP_BANNER_ENABLED ? `calc(100vh - ${184 + GLOBAL_TOP_BANNER_HEIGHT}px)` : 'calc(100vh - 184px)';

export const HOME_ADDRESS_NFT_STAKING_CONTRACT_ADDRESS = process?.env?.REACT_APP_ENV === 'prod' ? '' : '0x5ACD9Aa50B20b6E9F43c43c6Fbd81263D2C03b33';
export const HOME_ADDRESS_NFT_STAKING_CONTRACT_NETWORK = process?.env?.REACT_APP_ENV === 'prod' ? 'base' : 'base-sepolia';

export const COLLECTIONS_PAGE_ENTRIES = process?.env?.REACT_APP_ENV === 'prod' ? COLLECTIONS_ENTRIES_PROD : [...COLLECTIONS_ENTRIES_DEV, ...COLLECTIONS_ENTRIES_PROD];