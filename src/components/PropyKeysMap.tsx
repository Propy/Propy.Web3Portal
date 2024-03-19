import React, { useState, useEffect } from 'react';

import { PropsFromRedux } from '../containers/ReserveAnAddressHomeBannerContainer';

import PropyKeysMapCard from './PropyKeysMapCard';

import {
  NFTService,
} from '../services/api';

import {
  COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

import {
  ICoordinate,
  INFTCoordinateResponse,
} from '../interfaces';

import {
  GLOBAL_PAGE_HEIGHT,
} from '../utils/constants';

const maxEntries = 10000;

const PropyKeysMap = (props: PropsFromRedux) => {

  let {
    isConsideredMobile,
  } = props;

  let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === (process?.env?.REACT_APP_ENV === 'prod' ? 'propykeys' : 'propy-home-nft-dev-base-testnet'));

  const [nftCoordinates, setNftCoordinates] = useState<ICoordinate[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      if(collectionConfigEntry) {
        let collectionResponse = await NFTService.getCoordinates(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
        )
        // setIsLoading(false);
        if(collectionResponse?.status && collectionResponse?.data && isMounted) {
          let renderResults : ICoordinate[] = [];
          let apiResponseData : INFTCoordinateResponse = collectionResponse?.data?.data ? collectionResponse?.data : collectionResponse;
          if(collectionResponse?.status && apiResponseData?.data) {
            for(let nftRecord of apiResponseData?.data) {
              if(nftRecord.longitude && nftRecord.latitude && (renderResults.length < maxEntries)) {
                renderResults.push({
                  latitude: Number(nftRecord.latitude),
                  longitude: Number(nftRecord.longitude),
                  link: `token/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`,
                });
              }
            }
          }
          setNftCoordinates(renderResults);
        } else {
          setNftCoordinates([]);
        }
      }else {
        setNftCoordinates([]);
      }
    }
    fetchCollection();
    return () => {
      isMounted = false;
    }
  }, [collectionConfigEntry])

  return (
    <>
      <PropyKeysMapCard 
        height={GLOBAL_PAGE_HEIGHT}
        zoom={2}
        zoomControl={true}
        dragging={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        disableBorderRadius={true}
        // center={[38.171368, -95.430112]} // US center
        center={[24.424473, isConsideredMobile ? -80 : 10]}
        markers={nftCoordinates}
      />
    </>
  )
};

export default PropyKeysMap;