import { ChainId, shortenAddress } from '@usedapp/core'
import numeral from "numeral";

export const centerShortenLongString = (string: string, maxLength: number) => {
	if(typeof string === 'string') {
		if(string.length > maxLength) {
			let charCountForRemoval = string.length - maxLength;
			let stringHalfwayPoint = Math.floor(maxLength/2);
			string = string.slice(0, stringHalfwayPoint) + "..." + string.slice(stringHalfwayPoint + charCountForRemoval, string.length);
			return string;
		}else{
			return string;
		}
	}else{
		return '';
	}
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]?: string } = {
	1: '',
	3: 'ropsten.',
	4: 'rinkeby.',
	5: 'goerli.',
	42: 'kovan.',
	100: '',
	1337: '',
	56: '',
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
	42161: '',
	421611: '',
}
  
export function getEtherscanLink(
	chainId: ChainId,
	data: string,
	type: 'transaction' | 'token' | 'address' | 'block'
): string {
	const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

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

export const priceFormat = (number: number, decimals = 2, currency = "$", prefix = true) => {
	let decimalString = "";
	for(let i = 0; i < decimals; i++){
			decimalString += "0";
	}
	if (currency.length > 1) {
			prefix = false;
	}
	let format = '0,0.' + decimalString;
	if(number < 10) {
			format = getDynamicFormat(format, number);
	}
	let result = numeral(number).format(format);
	if(result === 'NaN') {
		result = '0.00';
	}
	if (prefix) {
			return `${currency}${'\u00A0'}`+ result;
	} else {
			return result + `${'\u00A0'}${currency}`
	}
}

export function getResolvableIpfsLink(ipfsUrl: string) {
	return ipfsUrl.replace('ipfs://', 'https://propy.mypinata.cloud/ipfs/');
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

export const getCookieValue = (name: string) => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)