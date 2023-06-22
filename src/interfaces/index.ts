export interface IType {
    test: boolean;
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