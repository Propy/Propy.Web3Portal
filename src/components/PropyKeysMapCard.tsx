import React, { memo } from 'react'

import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';

import LeafletMapContainer from '../containers/LeafletMapContainer';

import {
  ILeafletMapMarker,
  ICoordinate,
  INFTCoordinateResponse,
} from '../interfaces';

import {
  NFTService,
} from '../services/api';

import {
  COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

interface IPropyKeysMapCardProps {
  height?: string | number
  width?: string | number
  zoom?: number
  zoomControl?: boolean
  dragging?: boolean
  doubleClickZoom?: boolean
  scrollWheelZoom?: boolean
  markers?: ILeafletMapMarker[]
  center?: [number, number]
  disableBorderRadius?: boolean
}

const PropyKeysMapCard = (props: IPropyKeysMapCardProps) => {

  const {
    height = "320px",
    width = "100%",
    zoom = 2,
    zoomControl = true,
    dragging = true,
    doubleClickZoom = true,
    scrollWheelZoom = true,
    center,
    disableBorderRadius = false,
  } = props;

  const maxEntries = 10000;

  let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === (process?.env?.REACT_APP_ENV === 'prod' ? 'propykeys' : 'propy-home-nft-dev-base-testnet'));

  const { 
    data: nftCoordinates = [],
    // isLoading
  } = useQuery({
    queryKey: ['nftCoordinates', collectionConfigEntry],
    queryFn: async () => {
      if (collectionConfigEntry) {
        let collectionResponse = await NFTService.getCoordinates(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
        );
        if (collectionResponse?.status && collectionResponse?.data) {
          let renderResults: ICoordinate[] = [];
          let apiResponseData: INFTCoordinateResponse = collectionResponse?.data?.data
            ? collectionResponse?.data
            : collectionResponse;
          if (collectionResponse?.status && apiResponseData?.data) {
            for (let nftRecord of apiResponseData?.data) {
              if (nftRecord.longitude && nftRecord.latitude && renderResults.length < maxEntries) {
                renderResults.push({
                  latitude: Number(nftRecord.latitude),
                  longitude: Number(nftRecord.longitude),
                  link: `token/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`,
                });
              }
            }
          }
          return renderResults;
        }
      }
      return [];
    },
    cacheTime: Infinity, // Cache the data indefinitely
    staleTime: Infinity, // Data is always considered fresh
  });

  return (
    <Card style={{width, height, zIndex: 0, ...(disableBorderRadius && {borderRadius: 0})}}>
      <LeafletMapContainer 
        zoom={zoom}
        zoomControl={zoomControl}
        dragging={dragging}
        doubleClickZoom={doubleClickZoom}
        scrollWheelZoom={scrollWheelZoom}
        markers={nftCoordinates}
        center={center}
      />
    </Card>
  )
}

export default memo(PropyKeysMapCard);