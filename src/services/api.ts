import { $axios, $axiosCustom } from './axios';
import { AxiosResponse } from 'axios';
// import SnackbarUtils from '../utils/SnackbarUtilsConfigurator';

import {
  API_ENDPOINT,
  // API_IDENTITY_SERVER_URL,
} from '../utils/constants';

$axios.defaults.baseURL = `${API_ENDPOINT}/`;

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
  }

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