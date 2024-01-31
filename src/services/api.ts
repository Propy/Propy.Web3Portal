import { $axios, $axiosCustom, $axiosNoIntercept } from './axios';
import { AxiosResponse } from 'axios';
// import SnackbarUtils from '../utils/SnackbarUtilsConfigurator';

import {
  API_ENDPOINT,
  // API_IDENTITY_SERVER_URL,
} from '../utils/constants';

import {
  L1Networks,
  L2Networks,
} from '../interfaces';

$axios.defaults.baseURL = `${API_ENDPOINT}/`;
$axiosCustom.defaults.baseURL = `${API_ENDPOINT}/`;
$axiosNoIntercept.defaults.baseURL = `${API_ENDPOINT}/`;

export interface IApiResponse {
    data?: any;
}

// We use this for requests which don't use our default headers
export const ApiServiceCustom = {
  post(resource: string, params: any, config?: {[key: string]: any}) {
    return $axiosCustom.post(`${resource}`, params, config);
  },
}

export const ApiService = {

  query(resource: string, params: object) {
      return $axios.get(resource, {params}).catch(error => {
          throw new Error(`ApiService ${error}`);
      });
  },

  get(resource: string, slug = "") {
    return $axios.get(`${resource}/${slug}`).catch(error => {
        // SnackbarUtils.error('API connection unavailable');
        throw new Error(`ApiService ${error}`);
    });
  },

  post(resource: string, params: any, config?: {[key: string]: any}) {
      return $axios.post(`${resource}`, params, config);
  },

  patch(url: string, data: any, config?: {[key: string]: any}) {
    return $axios.patch(url, data, config);
  },

  postNoIntercept(resource: string, params: any, config?: {[key: string]: any}) {
    return $axiosNoIntercept.post(`${resource}`, params, config);
  },

  // update(resource, slug, params) {
  //     return $axios.put(`${resource}/${slug}`, params);
  // },

  // put(resource, params) {
  //     return $axios.put(`${resource}`, params);
  // },

  // delete(resource) {
  //     return $axios.delete(resource).catch(error => {
  //         throw new Error(`ApiService ${error}`);
  //     });
  // }
};

interface IAgentFlowPatch {
  Type?: number
  Location?: ILocationPatch
  DealsClosed?: string
  FirstName?: string
  LastName?: string
  Email?: string
  PhoneNumber?: string
}

interface ILocationPatch {
  placeId?: string
  placeDesc: string 
}

interface IBuyerFlowPatch {
  Type?: number
  Actions?: number[]
  Location?: ILocationPatch
  FirstName?: string
  LastName?: string
  Email?: string
  PhoneNumber?: string
  Purchase?: string
  PriceRange?: string
  HasAgent?: boolean
  AgentEmail?: string
  AgentPhone?: string
  AgentFirstName?: string
  AgentLastName?: string
  MessageToAgent?: string
}

export const FlowService = {
  async patchSession(sessionId: string, data: IAgentFlowPatch | IBuyerFlowPatch, captchaToken: string) {
    return ApiService.patch(`v3/leads/${sessionId}`, data, {
      headers: {
        "captcha-code": captchaToken
      }
    });
  },
}

export const NFTService = {
  async refreshMetadata(network: string, tokenAddress: string, tokenId: string) : Promise<AxiosResponse["data"]> {
    return ApiService.post(`nft/refresh-metadata`, {
      network: network,
      asset_address: tokenAddress,
      token_id: tokenId
    })
  },
  async getCollectionPaginated(
    network: string,
    contractNameOrCollectionNameOrAddress: string,
    perPage: number,
    page: number,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/nft/${network}`, `${contractNameOrCollectionNameOrAddress}?perPage=${perPage}&page=${page}`)
  },
  async getCoordinatesPaginated(
    network: string,
    contractNameOrCollectionNameOrAddress: string,
    perPage: number,
    page: number,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/nft/coordinates/${network}`, `${contractNameOrCollectionNameOrAddress}?perPage=${perPage}&page=${page}`)
  },
  async getRecentlyMintedPaginated(
    perPage: number,
    page: number,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/nft/recently-minted`, `?perPage=${perPage}&page=${page}`)
  }
}

export const AccountBalanceService = {
  async getAccountBalancesPaginated(
    account: string,
    perPage: number,
    page: number,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/balances`, `${account}?perPage=${perPage}&page=${page}`)
  }
}

export const SignerService = {
  async getSignerNonce(signerAddress: string) : Promise<AxiosResponse["data"]> {
    return ApiService.post(`/signature/nonce`, {
      signer_address: signerAddress,
    });
  },
  async validateSignedMessageAndPerformAction(plaintextMessage: string, signedMessage: string, signerAddress: string) : Promise<AxiosResponse["data"]> {
    return ApiService.post(`/signature/perform-action`, {
      signer_address: signerAddress,
      plaintext_message: plaintextMessage,
      signed_message: signedMessage,
    });
  }
}

export const BridgeService = {
  async getBaseBridgeTransactionsOverviewByAccountAndTokenAddresses(
    l1Network: L1Networks,
    l2Network: L2Networks,
    l1TokenAddress: string,
    l2TokenAddress: string,
    accountAddress: string,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/bridge/base/transactions`, `overview?accountAddress=${accountAddress}&l1Network=${l1Network}&l2Network=${l2Network}&l1TokenAddress=${l1TokenAddress}&l2TokenAddress=${l2TokenAddress}`);
  },
  async getBaseBridgeWithdrawalsOverviewByAccountAndTokenAddresses(
    l1Network: L1Networks,
    l2Network: L2Networks,
    l1TokenAddress: string,
    l2TokenAddress: string,
    accountAddress: string,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/bridge/base/withdrawals`, `overview?accountAddress=${accountAddress}&l1Network=${l1Network}&l2Network=${l2Network}&l1TokenAddress=${l1TokenAddress}&l2TokenAddress=${l2TokenAddress}`);
  },
  async getBaseBridgeDepositsOverviewByAccountAndTokenAddresses(
    l1Network: L1Networks,
    l2Network: L2Networks,
    l1TokenAddress: string,
    l2TokenAddress: string,
    accountAddress: string,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/bridge/base/deposits`, `overview?accountAddress=${accountAddress}&l1Network=${l1Network}&l2Network=${l2Network}&l1TokenAddress=${l1TokenAddress}&l2TokenAddress=${l2TokenAddress}`);
  },
  async getBaseBridgeTransactionOverviewByTransactionHash(
    l1Network: L1Networks,
    l2Network: L2Networks,
    transactionHash: string,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.get(`/bridge/base/transaction`, `overview?l1Network=${l1Network}&l2Network=${l2Network}&transactionHash=${transactionHash}`);
  },
  async triggerBaseBridgeSync(
    l1Network: L1Networks,
    l2Network: L2Networks,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.post(`/bridge/sync`, {
      l1_network: l1Network,
      l2_network: l2Network
    })
  },
  async triggerBaseBridgeOptimisticSync(
    l1Network: L1Networks,
    l2Network: L2Networks,
  ) : Promise<AxiosResponse["data"]> {
    return ApiService.postNoIntercept(`/bridge/sync`, {
      l1_network: l1Network,
      l2_network: l2Network
    })
  },
}