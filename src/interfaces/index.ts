export interface IType {
    test: boolean;
}

export interface IEVMTransactionRecord {
    network_name: string;
    hash: string;
    block_hash: string;
    block_number: string;
    block_timestamp: string;
    from: string;
    to: string;
    gas: string;
    input: string;
    nonce: string;
    r: string;
    s: string;
    v: string;
    transaction_index: string;
    type: string;
    value: string;
}

export type SupportedNetworks = 'ethereum' | 'arbitrum' | 'base' | 'base-sepolia' | 'goerli' | 'sepolia' | 'unsupported';

export type TokenStandard = "ERC-20" | "ERC-721";

export enum NetworkName {
    ethereum = "ethereum",
    ropsten = "ropsten",
    rinkeby = "rinkeby",
    goerli = "goerli",
    sepolia = "sepolia",
    optimism = "optimism",
    arbitrum = "arbitrum",
}

export interface ITransferEventERC721Record {
    network_name: NetworkName;
    block_number: string;
    block_hash: string;
    transaction_index: string;
    removed: boolean;
    contract_address: string;
    data: string;
    topic: string;
    from: string;
    to: string;
    token_id: string;
    transaction_hash: string;
    log_index: number;
    evm_transaction?: IEVMTransactionRecord;
    value?: string;
}

export interface ITransferEventERC20Record {
    network_name: NetworkName;
    block_number: string;
    block_hash: string;
    transaction_index: string;
    removed: boolean;
    contract_address: string;
    data: string;
    topic: string;
    from: string;
    to: string;
    transaction_hash: string;
    log_index: number;
    evm_transaction?: IEVMTransactionRecord;
    value: string;
}

export interface IAssetRecord {
    id: number;
    address: string;
    network_name: string;
    symbol: string;
    standard: TokenStandard;
    decimals: string;
    created_at: string;
    updated_at: string;
    deployment_block: string;
    name: string;
    collection_name: string;
    slug: string;
    last_price_usd: string;
    is_base_asset: boolean,
    market_cap_usd: string;
    volume_24hr_usd: string;
    change_24hr_usd_percent: string;
    coingecko_id: null | string;
    balance_record?: IBalanceRecord;
    transfer_events_erc721?: ITransferEventERC721Record[];
    transfer_events_erc20?: ITransferEventERC20Record[];
    transfer_event_erc20_count?: number;
}

export interface IBalanceRecord {
    network_name: string,
    asset_address: string,
    holder_address: string,
    token_id: string,
    balance: string,
    nft: INFTRecord,
    asset?: IAssetRecord
}

export interface INFTRecord {
    network_name: string,
    asset_address: string,
    token_id: string,
    metadata: string,
    balances?: IBalanceRecord[],
    asset?: IAssetRecord,
    transfer_events_erc721?: ITransferEventERC721Record[];
  }

export interface IPagination {
    total?: number
    count?: number
    perPage?: number
    currentPage?: number
    totalPages?: number
}

export interface IMixedBalancesResult {
    [key: string]: {
        [key: string]: {
            balances?: IBalanceRecord[],
            asset: IAssetRecord,
            balancesPagination?: IPagination
        },
    }
}

export interface IRecentlyMintedResult {
    data: INFTRecord[],
    metadata: {
        pagination: IPagination,
    }
}

export interface IOwnedBalancesResult {
    data: {
        [key: string]: {
            [key: string]: {
                balances?: IBalanceRecord[],
                asset: IAssetRecord,
                balancesPagination?: IPagination
            },
        }
    },
    metadata: {
        pagination: IPagination,
    }
}

export interface IAttribute {
    trait_type: string;
    value: string;
}
export interface ITokenMetadataTimelineEntry {
    milestone: string;
    due_date?: number;
    date?: number;
    complete: boolean;
    is_estimate?: boolean;
}

export interface ITokenMetadata {
    name: string;
    token_id?: string;
    description?: string;
    image: string;
    attributes: IAttribute[];
    timeline?: ITokenMetadataTimelineEntry[];
}

export interface ISignMessageError {
    code: number;
    message: string;
}

export interface INonceResponse {
    data: {
        nonce: number;
        salt: string;
    }
}

export interface IOfferRecord {
    asset_address: string;
    offer_token_address: string;
    offer_token_amount: string;
    timestamp_unix: number; 
    token_id: string; 
    user_address: string;
    offer_token: IAssetRecord;
}

export interface ILeafletMapMarker {
    longitude: number;
    latitude: number;
}

export interface IHorizontalScrollingTextEntry {
    string: string;
    link?: string;
}