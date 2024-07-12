import React, { useState, useEffect } from 'react';

import PlaceholderImage from '../assets/img/placeholder.webp';

import SingleListingCardBaseline from './SingleListingCardBaseline';

import {
  IBalanceRecord,
  IAssetRecord,
  IPropyKeysHomeListingRecord,
} from '../interfaces';

import {
  getResolvableIpfsLink,
} from '../utils';

interface ISingleListingCardProps {
  balanceRecord?: IBalanceRecord,
  assetRecord: IAssetRecord,
  listingRecord: IPropyKeysHomeListingRecord,
  selectable?: boolean,
  onBalanceRecordSelected?: (balanceRecord: IBalanceRecord) => void,
  selected?: boolean,
  disabled?: boolean,
  listingCollectionName: string,
}

const SingleListingCard = (props: ISingleListingCardProps) => {

  const {
    assetRecord,
    balanceRecord,
    listingRecord,
    selectable,
    onBalanceRecordSelected,
    selected,
    disabled,
    listingCollectionName,
  } = props;

  const [tokenImage, setTokenImage] = useState(PlaceholderImage);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState(listingCollectionName);
  const [tokenContractAddress, setTokenContractAddress] = useState<false | string>(false);
  const [tokenNetwork, setTokenNetwork] = useState<false | string>(false);
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    let useRecord;
    if (listingRecord) {
      useRecord = listingRecord;
    }
    if(useRecord) {
      if(useRecord.network_name) {
        setTokenNetwork(useRecord.network_name);
      }
      if(useRecord?.images && useRecord?.images?.[0]) {
        setTokenImage(getResolvableIpfsLink(useRecord?.images[0]));
      } else {
        setTokenImage(PlaceholderImage);
      }
      if(useRecord.full_address) {
        setTokenTitle(useRecord.full_address);
      }
      if(useRecord.token_id) {
        setTokenId(`${useRecord.token_id}`);
      }
      setTokenLink(`listing/${useRecord.network_name}/${useRecord.asset_address}/${useRecord.token_id}`);
    } else {
      setTokenContractAddress(false);
      setTokenNetwork(false);
    }
    if(listingCollectionName) {
      setTokenCollectionName(listingCollectionName);
    } else {
      setTokenCollectionName('');
    }
  }, [balanceRecord, assetRecord, listingRecord, listingCollectionName])

  return (
    <SingleListingCardBaseline
      balanceRecord={balanceRecord}
      selectable={selectable}
      onBalanceRecordSelected={onBalanceRecordSelected}
      selected={selected}
      disabled={disabled}
      tokenLink={tokenLink}
      tokenImage={tokenImage}
      tokenId={tokenId}
      tokenCollectionName={tokenCollectionName}
      tokenContractAddress={tokenContractAddress ? tokenContractAddress : undefined}
      tokenNetwork={tokenNetwork ? tokenNetwork : undefined}
      tokenTitle={tokenTitle}
      listingRecord={listingRecord}
    />
  )
}

export default SingleListingCard;