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
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const PROPY_LIGHT_GREY = "#f6f6f6";

export const PROPY_LIGHT_BLUE = "#38A6FB";

const COLLECTIONS_ENTRIES_DEV = [
  {
    network: "sepolia",
    address: "0x77932CA68a539a738d167Ec019B6aE7596766152",
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

export const NETWORK_ID_TO_NAME : {[key: number]: string} = {
	1: 'ethereum',
	42161: 'arbitrum',
}

export const IS_GLOBAL_TOP_BANNER_ENABLED = true;
export const GLOBAL_TOP_BANNER_HEIGHT = 28;

export const COLLECTIONS_PAGE_ENTRIES = process?.env?.REACT_APP_ENV === 'prod' ? COLLECTIONS_ENTRIES_PROD : [...COLLECTIONS_ENTRIES_DEV, ...COLLECTIONS_ENTRIES_PROD];