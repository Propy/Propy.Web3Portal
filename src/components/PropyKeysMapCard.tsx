import React, { memo } from 'react'

import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';

import LeafletMapContainer from '../containers/LeafletMapContainer';

import {
  ICoordinate,
  INFTCoordinateResponse,
  IPropyKeysMapFilterOptions,
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
  center?: [number, number]
  disableBorderRadius?: boolean
  propyKeysMapFilterOptions?: IPropyKeysMapFilterOptions
  collectionName?: string
}

const findCollectionConfig = (slug: string | undefined, entries: typeof COLLECTIONS_PAGE_ENTRIES) => {
  const requiredSlug = slug || 'propykeys';
  return entries.find(entry => entry.slug === requiredSlug);
};

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
    collectionName,
    propyKeysMapFilterOptions,
  } = props;

  const maxEntries = 10000;

  let collectionConfigEntry = findCollectionConfig(collectionName, COLLECTIONS_PAGE_ENTRIES);

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
          let linkPrefix = `token`;
          if(propyKeysMapFilterOptions?.onlyListedHomes) {
            linkPrefix = `listing`
          }
          if (collectionResponse?.status && apiResponseData?.data) {
            for (let nftRecord of apiResponseData?.data) {
              if (nftRecord.longitude && nftRecord.latitude && renderResults.length < maxEntries) {
                renderResults.push({
                  latitude: Number(nftRecord.latitude),
                  longitude: Number(nftRecord.longitude),
                  link: `${linkPrefix}/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`,
                });
              }
            }
          }
          return renderResults;
        }
      }
      return [];
    },
    gcTime: Infinity, // Cache the data indefinitely
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