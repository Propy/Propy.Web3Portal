import React, { memo, useState } from 'react'

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import Card from '@mui/material/Card';

import LeafletMapContainer from '../containers/LeafletMapContainer';

import {
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
  center?: [number, number]
  disableBorderRadius?: boolean
}

const PropyKeysMapCardPostGIS = (props: IPropyKeysMapCardProps) => {

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

  const [boundsRect, setBoundsRect] = useState("-180,-90,180,90");

  const maxEntries = 10000;

  let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === 'propykeys');

  const [debouncedBoundsRect] = useDebounce(boundsRect, 1000);

  console.log({boundsRect, debouncedBoundsRect});

  const { 
    data: nftCoordinates = [],
    // isLoading
  } = useQuery<ICoordinate[], Error>({
    queryKey: ['nftCoordinates-PostGIS', collectionConfigEntry, boundsRect],
    queryFn: async () => {
      if (collectionConfigEntry) {
        // let collectionResponseClusters = await NFTService.getCoordinatesPostGISClusters(
        //   collectionConfigEntry.network,
        //   collectionConfigEntry.address,
        // );
        let collectionResponsePoints = await NFTService.getCoordinatesPostGISPoints(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
          boundsRect,
        );
        let collectionResponse = collectionResponsePoints;
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
    keepPreviousData: true,
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
        disableClustering={false}
        onBoundsUpdate={(boundsRect: string) => setBoundsRect(boundsRect)}
      />
    </Card>
  )
}

export default memo(PropyKeysMapCardPostGIS);