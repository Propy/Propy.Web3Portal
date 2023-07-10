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

export type SupportedNetworks = 'ethereum' | 'arbitrum';

export interface ITransferEventERC721Record {
    network: string;
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
}

export interface ITransferEventERC20Record {
    network: string;
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
}

export interface IAssetRecord {
    id: number;
    address: string;
    network_name: string;
    symbol: string;
    standard: string;
    decimals: string;
    created_at: string;
    updated_at: string;
    deployment_block: string;
    name: string;
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
    metadata: string,
    asset?: IAssetRecord
}

export interface IAttribute {
    trait_type: string;
    value: string;
}

export interface ITokenMetadata {
    name: string;
    image: string;
    attributes: IAttribute[];
}