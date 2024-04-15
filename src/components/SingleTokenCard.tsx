import React, { useState, useEffect } from 'react';

import { utils } from "ethers";

import DefaultTokenImage from '../assets/img/default-token.webp';
import PlaceholderImage from '../assets/img/placeholder.webp';

import SingleTokenCardBaseline from './SingleTokenCardBaseline';

import {
  IBalanceRecord,
  IAssetRecord,
  INFTRecord,
} from '../interfaces';

import {
  getResolvableIpfsLink,
  priceFormat,
} from '../utils';

interface ISingleTokenCardProps {
  balanceRecord?: IBalanceRecord,
  assetRecord: IAssetRecord,
  nftRecord?: INFTRecord,
  selectable?: boolean,
  onBalanceRecordSelected?: (balanceRecord: IBalanceRecord) => void,
  selected?: boolean,
  disabled?: boolean,
}

const SingleTokenCard = (props: ISingleTokenCardProps) => {

  const {
    assetRecord,
    balanceRecord,
    nftRecord,
    selectable,
    onBalanceRecordSelected,
    selected,
    disabled,
  } = props;

  const [tokenImage, setTokenImage] = useState(PlaceholderImage);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState('');
  const [tokenContractAddress, setTokenContractAddress] = useState<false | string>(false);
  const [tokenNetwork, setTokenNetwork] = useState<false | string>(false);
  const [tokenStandard, setTokenStandard] = useState('');
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    let tokenRecordMetadata;
    let useRecord;
    if(balanceRecord) {
      tokenRecordMetadata = balanceRecord.nft?.metadata ? balanceRecord.nft?.metadata : {};
      useRecord = balanceRecord;
      if (assetRecord?.standard === "ERC-20") {
        setTokenImage(DefaultTokenImage);
        let balance = priceFormat(Number(utils.formatUnits(useRecord.balance, assetRecord.decimals)), 2, assetRecord.symbol, false);
        setTokenTitle(balance);
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}`);
      }
    } else if (nftRecord) {
      tokenRecordMetadata = nftRecord.metadata ? nftRecord.metadata : {};
      useRecord = nftRecord;
    }
    if(useRecord) {
      if(useRecord.asset?.standard) {
        setTokenStandard(useRecord.asset.standard);
        setTokenContractAddress(useRecord.asset.address);
        setTokenNetwork(useRecord.network_name);
      }
      if(assetRecord?.standard === "ERC-721") {
        if(tokenRecordMetadata?.image) {
          setTokenImage(getResolvableIpfsLink(tokenRecordMetadata?.image));
        } else {
          setTokenImage(PlaceholderImage);
        }
        if(tokenRecordMetadata?.name) {
          setTokenTitle(tokenRecordMetadata?.name);
        }
        if(useRecord.token_id) {
          setTokenId(useRecord.token_id);
        }
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}/${useRecord.token_id}`);
      }
    } else {
      setTokenContractAddress(false);
      setTokenNetwork(false);
    }
    if(assetRecord) {
      if(assetRecord?.collection_name) {
        setTokenCollectionName(assetRecord?.collection_name);
      } else if(assetRecord?.name) {
        setTokenCollectionName(assetRecord?.name);
      }
    }
  }, [balanceRecord, assetRecord, nftRecord])

  return (
    <SingleTokenCardBaseline
      balanceRecord={balanceRecord}
      selectable={selectable}
      onBalanceRecordSelected={onBalanceRecordSelected}
      selected={selected}
      disabled={disabled}
      tokenLink={tokenLink}
      tokenImage={tokenImage}
      tokenStandard={tokenStandard}
      tokenId={tokenId}
      tokenCollectionName={tokenCollectionName}
      tokenContractAddress={tokenContractAddress ? tokenContractAddress : undefined}
      tokenNetwork={tokenNetwork ? tokenNetwork : undefined}
      tokenTitle={tokenTitle}
    />
  )
}

export default SingleTokenCard;