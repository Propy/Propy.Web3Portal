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

export type L1Networks = 'ethereum' | 'goerli' | 'sepolia'
export type L2Networks = 'arbitrum' | 'base' | 'base-sepolia' | 'base-goerli'

export type SupportedNetworks = L1Networks | L2Networks | 'unsupported';

export type TokenStandard = "ERC-20" | "ERC-721";

export enum NetworkName {
    ethereum = "ethereum",
    ropsten = "ropsten",
    rinkeby = "rinkeby",
    goerli = "goerli",
    sepolia = "sepolia",
    optimism = "optimism",
    arbitrum = "arbitrum",
    base = "base",
    'base-sepolia' = 'base-sepolia',
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

export interface IPropyKeysHomeListingRecord {
    id: number;
    network_name: string;
    asset_address: string;
    token_id: number;
    full_address: string;
    price: number;
    description: string;
    bedrooms: number;
    bathrooms: number;
    size: number;
    floor: number;
    floors: number;
    type: string;
    year_built: number;
    lot_size: number;
    images: string[];
    propykeys_internal_listing_id: string;
    collection_name: string;
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
    metadata: ITokenMetadata,
    balances?: IBalanceRecord[],
    asset?: IAssetRecord,
    longitude?: number,
    latitude?: number,
    transfer_events_erc721?: ITransferEventERC721Record[];
}

export interface INFTAsset {
    [key: string]: IAssetRecord
}

export interface ICollectionRecord {
    name: string;
    collection_name: string;
    slug: string;
}

type NFTExplorerGalleryEntry = {
    type: 'NFT';
    nftRecord: INFTRecord;
    collectionRecord: ICollectionRecord;
}

type ListingExplorerGalleryEntry = {
    type: 'LISTING';
    listingRecord: IPropyKeysHomeListingRecord;
    collectionRecord: ICollectionRecord;
}

export type IExplorerGalleryEntry = NFTExplorerGalleryEntry | ListingExplorerGalleryEntry;

export interface ICoordinate {
    longitude: number
    latitude: number
    link: string
    type?: 'listing' | 'token',
    asset_address?: string,
    token_id?: string,
    network_name?: string,
}

export interface IPagination {
    total?: number
    count?: number
    perPage?: number
    currentPage?: number
    totalPages?: number
}

export interface IPaginationNoOptional {
    total: number
    count: number
    perPage: number
    currentPage: number
    totalPages: number
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

export interface IListingCollectionResult {
    data: IPropyKeysHomeListingRecord[],
    metadata: {
        pagination: IPagination,
    }
}

export interface INFTCoordinatePaginatedResponse {
    data: INFTCoordinateEntry[],
    metadata: {
        pagination: IPagination,
    }
}

export interface INFTCoordinateResponse {
    data: INFTCoordinateEntry[],
}

export interface INFTCoordinateEntry {
    longitude: string;
    latitude: string;
    asset_address: string;
    token_id: string;
    network_name: string;
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

export interface ICollectionQueryFilter {
    filter_type: string;
    value: string | boolean;
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
    link?: string;
    type?: 'listing' | 'token',
    asset_address?: string,
    token_id?: string,
    network_name?: string,
}

export interface IHorizontalScrollingTextEntry {
    string: string;
    link?: string;
}

export interface IBaseWithdrawalProvenEvent {
    id: number;
    network_name: string;
    block_number: number;
    block_hash: string;
    transaction_index: number;
    removed: boolean;
    contract_address: string;
    data: string;
    topic: string;
    withdrawal_hash: string;
    from: string;
    to: string;
    transaction_hash: string;
    log_index: number;
    event_fingerprint: string;
    created_at: Date;
    updated_at: Date;
    evm_transaction?: IEVMTransactionRecord;
}
  
export interface IBaseWithdrawalFinalizedEvent {
    id: number;
    network_name: string;
    block_number: number;
    block_hash: string;
    transaction_index: number;
    removed: boolean;
    contract_address: string;
    data: string;
    topic: string;
    withdrawal_hash: string;
    success: boolean;
    transaction_hash: string;
    log_index: number;
    event_fingerprint: string;
    created_at: Date;
    updated_at: Date;
}

export interface IBaseWithdrawalInitiatedEvent {
    network_name: string;
    block_number: string;
    block_hash: string;
    transaction_index: number;
    removed: boolean;
    contract_address: string;
    data: string;
    topic: string;
    l1_token_address: string;
    l2_token_address: string;
    from: string;
    to: string;
    amount: string;
    extra_data: string;
    transaction_hash: string;
    log_index: number;
    status: string | null;
    withdrawal_hash: string;
    event_fingerprint: string;
    created_at: Date;
    updated_at: Date;
    type?: string;
    evm_transaction?: IEVMTransactionRecord;
    withdrawal_proven_event?: IBaseWithdrawalProvenEvent;
    withdrawal_finalized_event?: IBaseWithdrawalFinalizedEvent;
}

export interface ITimeseries {
    date: string;
    value: number;
}

export interface ITimeseriesUTCDayAPIResponse {
    data: {
        utc_day: string,
        record_count: string,
    }[]
}

export interface IPropyKeysMapFilterOptions {
    onlyListedHomes: boolean;
    onlyLandmarks: boolean;
}

export interface IFullScreenGalleryImageEntry {
    index: number;
    imgUrl: string;
    title?: string;
    description?: string;
}

export interface IFullScreenGalleryConfig {
    visible: boolean;
    images: string[];
    selectedImageIndex: number;
    onFullscreenGalleryClose: (arg0?: any) => void;
}