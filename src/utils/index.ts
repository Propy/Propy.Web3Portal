import { ChainId, shortenAddress } from '@usedapp/core'
import numeral from "numeral";
import * as isIPFS from 'is-ipfs';
import { utils } from "ethers";

import {
	NetworkName,
} from '../interfaces';

export const centerShortenLongString = (string: string, maxLength: number, leftPadding: number = 0) => {
	if(typeof string === 'string') {
		if(string.length > maxLength) {
			let charCountForRemoval = string.length - maxLength;
			let stringHalfwayPoint = Math.floor(maxLength/2);
			string = string.slice(0, stringHalfwayPoint + leftPadding) + "..." + string.slice(stringHalfwayPoint + charCountForRemoval, string.length);
			return string;
		}else{
			return string;
		}
	}else{
		return '';
	}
}

export const toChecksumAddress = (string: string) => {
	let checksumHolderAddress = string;
	try {
		checksumHolderAddress = utils.getAddress(string);
	} catch (error) {
		return string;
	}
	return checksumHolderAddress;
}

enum ExtraChainId {
	Base = 8453,
	BaseSepolia = 84532,
}

const ETHERSCAN_PREFIXES_CHAIN_ID: { [chainId in ChainId | ExtraChainId]?: string } = {
	1: 'etherscan.io',
	3: 'ropsten.etherscan.io',
	4: 'rinkeby.etherscan.io',
	5: 'goerli.etherscan.io',
	42: 'kovan.etherscan.io',
	100: '',
	1337: '',
	56: 'bscscan.com',
	97: '',
	137: '',
	361: '',
	365: '',
	1285: '',
	80001: '',
	1666600000: '',
	11297108109: '',
	31337: '',
	250: '',
	43114: '',
	19: '',
	1287: '',
	25: '',
	338: '',
	1284: '',
	42262: '',
	588: '',
	69: '',
	10: '',
	42161: 'arbiscan.io',
	421611: '',
	11155111: 'sepolia.etherscan.io',
	84532: 'sepolia.basescan.org',
	8453: 'basescan.org',
}

export function getEtherscanLinkByChainId(
	chainId: ChainId,
	data: string,
	type: 'transaction' | 'token' | 'address' | 'block'
): string {
	const prefix = `https://${ETHERSCAN_PREFIXES_CHAIN_ID[chainId] || ETHERSCAN_PREFIXES_CHAIN_ID[1]}`

	switch (type) {
		case 'transaction': {
		return `${prefix}/tx/${data}`
		}
		case 'token': {
		return `${prefix}/token/${data}`
		}
		case 'block': {
		return `${prefix}/block/${data}`
		}
		case 'address':
		default: {
		return `${prefix}/address/${data}`
		}
	}
}

const ETHERSCAN_PREFIXES_NETWORK_NAME: { [networkName in NetworkName]?: string } = {
	'ethereum': 'etherscan.io',
	'ropsten': 'ropsten.etherscan.io',
	'rinkeby': 'rinkeby.etherscan.io',
	'goerli': 'goerli.etherscan.io',
	'arbitrum': 'arbiscan.io',
	'sepolia': 'sepolia.etherscan.io',
	'base-sepolia': 'sepolia.basescan.org',
	'base': 'basescan.org'
}
  
export function getEtherscanLinkByNetworkName(
	networkName: NetworkName,
	data: string,
	type: 'transaction' | 'token' | 'address' | 'block'
): string {
	const prefix = `https://${ETHERSCAN_PREFIXES_NETWORK_NAME[networkName] || ETHERSCAN_PREFIXES_NETWORK_NAME['ethereum']}`

	switch (type) {
		case 'transaction': {
		return `${prefix}/tx/${data}`
		}
		case 'token': {
		return `${prefix}/token/${data}`
		}
		case 'block': {
		return `${prefix}/block/${data}`
		}
		case 'address':
		default: {
		return `${prefix}/address/${data}`
		}
	}
}

export function isAddress(address: string | undefined): boolean { 
	try {
		shortenAddress(address ? address : '')
		return true
	}catch{
		return false
	}
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDynamicFormat = (currentFormat = '0,0.00', number: number) => {
	let requestedDecimals = 0;
	let preDecimalFormat;
	let postDecimalFormat;
	if(currentFormat.split(".").length > 0) {
			requestedDecimals = currentFormat.split(".")[1].length;
			postDecimalFormat = currentFormat.split(".")[1];
			preDecimalFormat = currentFormat.split(".")[0];
	}
	let currentFormattedNumber = numeral(number).format(currentFormat).toString();
	let currentFormattedDecimals = '';
	if(currentFormattedNumber.split('.') && currentFormattedNumber.split('.')[1]) {
			currentFormattedDecimals = currentFormattedNumber.split('.')[1];
	}
	let currentUnformattedDecimals = '';
	if(number.toString().split(".").length > 0 && number.toString().split(".")[1]) {
			currentUnformattedDecimals = number.toString().split(".")[1];
	}
	let dynamicFormat = currentFormat;
	if((currentFormattedDecimals.replace(/[^1-9]/g,"").length < requestedDecimals) && (currentUnformattedDecimals.replace(/[^1-9]/g,"").length >= requestedDecimals)) {
			let indexOfSignificantFigureAchievement = 0;
			let significantFiguresEncountered = 0;
			let numberString = number.toString();
			let numberStringPostDecimal = "";
			if(numberString.split(".").length > 0) {
					numberStringPostDecimal = numberString.split(".")[1]
			}
			for(let i = 0; i < numberStringPostDecimal.length; i++) {
					// @ts-ignore
					if((numberStringPostDecimal[i] * 1) > 0) {
							significantFiguresEncountered++;
							if(significantFiguresEncountered === requestedDecimals) {
									indexOfSignificantFigureAchievement = i + 1;
							}
					}
			}
			if(indexOfSignificantFigureAchievement > requestedDecimals) {
					let requestedDecimalsToSignificantFiguresDelta = indexOfSignificantFigureAchievement - requestedDecimals;
					dynamicFormat = preDecimalFormat + ".";
					if(postDecimalFormat) {
							dynamicFormat = preDecimalFormat + "." + postDecimalFormat;
					}
					for(let i = 0; i < requestedDecimalsToSignificantFiguresDelta; i++) {
							dynamicFormat = dynamicFormat + "0";
					}
			}
	}
	return dynamicFormat;
}

export const priceFormat = (number: number | string, decimals = 2, currency = "$", prefix = true, roundDown = false) => {
	let decimalString = "";
	for(let i = 0; i < decimals; i++){
			decimalString += "0";
	}
	if (currency.length > 1) {
			prefix = false;
	}
	let format = '0,0.' + decimalString;
	if(Number(number) < 10) {
			format = getDynamicFormat(format, Number(number));
	}
	let result = numeral(number).format(format);
	if(roundDown) {
		result = numeral(number).format(format, Math.floor);
	}
	if(result === 'NaN') {
		result = '0.00';
	}
	if(currency && (currency.length > 0)) {
		if (prefix) {
			return `${currency}${'\u00A0'}`+ result;
		} else {
			return result + `${'\u00A0'}${currency}`
		}
	}
	return result;
}

export function getResolvableIpfsLink(ipfsUrl: string = "") {
	return ipfsUrl.replace('ipfs://', 'https://propy.mypinata.cloud/ipfs/');
}

export function isIPFSMultiHash(value: string) {
	return isIPFS.multihash(value);
}

export function getResolvableIpfsLinkFromPlainMultiHash(ipfsMultiHash: string) {
	return getResolvableIpfsLink(`ipfs://${ipfsMultiHash}`);
}

export const parseJwt = (token: string) => {
	var base64Url = token.split('.')[1];
	var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	var jsonPayload = decodeURIComponent(
			window
					.atob(base64)
					.split('')
					.map(function (c) {
							return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					})
					.join('')
	);

	return JSON.parse(jsonPayload);
}

export const capitalizeFirstLetter = (str: string): string => {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const capitalizeEachFirstLetterWithDelimiter = (str: string, delimeter: string): string => {
	if (!str) return str;
	let result : string[] = [];
	let parts = str.split(delimeter);
	for(let part of parts) {
		result.push(capitalizeFirstLetter(part));
	}
	return result.join(" ");
}

export const getCookieValue = (name: string) => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

export const constructSignerMessage = (
	signerAccount: string,
	nonce: number,
	salt: string,
	chainId: number,
	actionType: string,
	metadata: any
) => {
	if(!isNaN(nonce) && salt && actionType) {
		return JSON.stringify({
			account: signerAccount,
			action: actionType,
			metadata,
			timestamp: Math.floor(new Date().getTime() / 1000),
			chain_id: chainId,
			nonce,
			salt,
		}, null, 4);
	} else {
		return false;
	}
}

export const countdownToTimestamp = (unixTimestamp: number, completeText: string, showFullTimer?: boolean): string => {
	// Get the current time and calculate the difference
	const now = new Date().getTime();
	const diff = (unixTimestamp * 1000) - now;

	// Ensure the timestamp is in the future
	if (diff <= 0) {
			return completeText;
	}

	// Calculate days, hours, minutes, and seconds
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	// Format the countdown string
	let countdownString = "";
	if (days > 0) {
			countdownString += `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} `;
			if(showFullTimer) {
				countdownString += `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`;
			}
	} else if (hours > 0) {
			countdownString += `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} `;
			if(showFullTimer) {
				countdownString += `${seconds} second${seconds > 1 ? 's' : ''}`;
			}
	} else if (minutes > 0) {
			countdownString += `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`;
	} else {
			countdownString += `${seconds} second${seconds > 1 ? 's' : ''}`;
	}

	return countdownString.trim();
}

/**
 * Interface for the NFT metadata
 */
interface UniswapNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: any; // For any additional properties
}

/**
 * Decodes a Uniswap NFT tokenURI string
 * 
 * @param tokenURI - The tokenURI string to decode
 * @returns The decoded NFT metadata
 * @throws Error if the tokenURI format is invalid or decoding fails
 */
export const decodeUniswapNFTTokenURI = (tokenURI: string): UniswapNFTMetadata => {
  // Check if the URI is in the data URI format
  if (!tokenURI.startsWith('data:application/json;base64,')) {
    throw new Error('Invalid tokenURI format: Expected data:application/json;base64,');
  }

  try {
    // Extract the base64 part
    const base64Part = tokenURI.split('base64,')[1];
    
    // Decode the base64 string
    const decodedData = atob(base64Part);
    
    // Parse the JSON
    const metadata: UniswapNFTMetadata = JSON.parse(decodedData);

		console.log({metadata})
    
    return metadata;
  } catch (error) {
    throw new Error(`Failed to decode NFT metadata: ${(error as Error).message}`);
  }
};

/**
 * Decodes the SVG image from a Uniswap NFT metadata
 * 
 * @param metadata - The Uniswap NFT metadata
 * @returns The decoded SVG as a string, or null if no valid SVG image
 */
export const decodeSVGImage = (metadata: UniswapNFTMetadata): string | null => {
  if (!metadata.image) {
    return null;
  }
  
  if (!metadata.image.startsWith('data:image/svg+xml;base64,')) {
    return null;
  }
  
  try {
    // Extract the base64 part
    const svgBase64 = metadata.image.split('base64,')[1];
    
    // Decode the base64 string
    const svgContent = atob(svgBase64);
    
    return svgContent;
  } catch (error) {
    throw new Error(`Failed to decode SVG image: ${(error as Error).message}`);
  }
};