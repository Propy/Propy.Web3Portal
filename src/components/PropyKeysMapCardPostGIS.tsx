import React, { memo, useState, useCallback, useMemo } from 'react'

import { animated, useSpring, config } from '@react-spring/web'

import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';

import LeafletMapContainer from '../containers/LeafletMapContainer';
import AdditionalMapControlOverlayContainer from '../containers/AdditionalMapControlOverlayContainer';

import SingleTokenCardBaseline from './SingleTokenCardBaseline';
import SingleListingCardBaseline from './SingleListingCardBaseline';
import LinkWrapper from './LinkWrapper';

import LogoDarkMode from '../assets/svg/propy-logo-house-only.svg'

import {
  ICoordinate,
  INFTCoordinateResponse,
  IPropyKeysMapFilterOptions,
  ILeafletMapMarker,
  INFTRecord,
  IPropyKeysHomeListingRecord,
} from '../interfaces';

import {
  NFTService,
  PropyKeysListingService,
} from '../services/api';

import {
  COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

import {
  getResolvableIpfsLink
} from '../utils';

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
  propyKeysMapFilterOptions: IPropyKeysMapFilterOptions
  collectionName?: string
}

const findCollectionConfig = (slug: string | undefined, entries: typeof COLLECTIONS_PAGE_ENTRIES) => {
  const requiredSlug = slug || 'propykeys';
  return entries.find(entry => entry.slug === requiredSlug);
};

interface ISelectedPopupConfig {
  type: "listing" | "token" | false,
  asset_address: string | false;
  network: string | false;
  token_id: string | false;
}

interface IFetchedPopupData {
  type: "listing" | "token" | "unknown",
  data: INFTRecord | IPropyKeysHomeListingRecord | null,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loadingIconContainer: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    },
    loadingIcon: {
      width: 'auto',
      height: 75,
    }
  }),
);

const createListingPopupNode = (listingRecord: IPropyKeysHomeListingRecord) => {
  return (
    <div style={{width: 300, height: 309}}>
      <LinkWrapper link={`${window.location.origin}/#/token/${listingRecord.network_name}/${listingRecord.asset_address}/${listingRecord.token_id}`} external={true}>
        <SingleListingCardBaseline
          tokenImage={listingRecord.images[0]}
          tokenCollectionName={listingRecord.collection_name}
          tokenContractAddress={listingRecord.asset_address}
          tokenNetwork={listingRecord.network_name}
          tokenTitle={listingRecord.full_address}
          listingRecord={listingRecord}
        />
      </LinkWrapper>
    </div>
  )
}

const createTokenPopupNode = (tokenRecord: INFTRecord) => {
  return (
    <div style={{width: 300, height: 298}}>
      <LinkWrapper link={`${window.location.origin}/#/token/${tokenRecord.network_name}/${tokenRecord.asset_address}/${tokenRecord.token_id}`} external={true}>
        <SingleTokenCardBaseline
          tokenLink={''}
          tokenImage={getResolvableIpfsLink(tokenRecord.metadata?.image)}
          tokenStandard={tokenRecord.asset?.standard}
          tokenId={tokenRecord.token_id}
          tokenCollectionName={tokenRecord.asset?.collection_name}
          tokenContractAddress={tokenRecord.asset_address}
          tokenNetwork={tokenRecord.network_name}
          tokenTitle={tokenRecord.metadata.name}
        />
      </LinkWrapper>
    </div>
  )
}

const PropyKeysMapCardPostGIS = (props: IPropyKeysMapCardProps) => {

  const classes = useStyles();

  const [selectedPopupConfig, setSelectedPopupConfig] = useState<ISelectedPopupConfig>({
    type: false,
    asset_address: false,
    network: false,
    token_id: false,
  });

  const [isPopupOpen, setPopupOpen] = useState(false);

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
    propyKeysMapFilterOptions,
    collectionName,
  } = props;

  const [boundsRect, setBoundsRect] = useState("-180,-90,180,90");

  const maxEntries = 10000;

  let collectionConfigEntry = findCollectionConfig(collectionName, COLLECTIONS_PAGE_ENTRIES);

  const { 
    data: nftCoordinatesGIS = [],
    isLoading,
    isFetching
  } = useQuery<ICoordinate[], Error>({
    queryKey: ['nftCoordinates-PostGIS', collectionConfigEntry?.address, collectionConfigEntry?.network, boundsRect, propyKeysMapFilterOptions],
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
          propyKeysMapFilterOptions,
        );
        let collectionResponse = collectionResponsePoints;
        if (collectionResponse?.status && collectionResponse?.data) {
          let renderResults: ICoordinate[] = [];
          let apiResponseData: INFTCoordinateResponse = collectionResponse?.data?.data
            ? collectionResponse?.data
            : collectionResponse;
          let linkPrefix = `token`;
          if(propyKeysMapFilterOptions.onlyListedHomes) {
            linkPrefix = `listing`
          }
          if (collectionResponse?.status && apiResponseData?.data) {
            for (let nftRecord of apiResponseData?.data) {
              if (nftRecord.longitude && nftRecord.latitude && renderResults.length < maxEntries) {
                renderResults.push({
                  latitude: Number(nftRecord.latitude),
                  longitude: Number(nftRecord.longitude),
                  link: `${linkPrefix}/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`,
                  type: propyKeysMapFilterOptions.onlyListedHomes ? 'listing' : 'token',
                  asset_address: nftRecord.asset_address,
                  token_id: nftRecord.token_id,
                  network_name: nftRecord.network_name,
                });
              }
            }
          }
          return renderResults;
        }
      }
      return [];
    },
    enabled: !isPopupOpen,
    gcTime: Infinity, // Cache the data indefinitely
    staleTime: Infinity, // Data is always considered fresh
    placeholderData: keepPreviousData,
  });

  const onBoundsUpdate = useCallback((boundsRect: string) => {
    setBoundsRect(boundsRect);
  }, []);

  const onMarkerSelection = useCallback((marker: ILeafletMapMarker) => {
    setSelectedPopupConfig({
      type: marker.type ? marker.type : false,
      asset_address: marker.asset_address ? marker.asset_address : false,
      network: marker.network_name ? marker.network_name : false,
      token_id: marker.token_id ? marker.token_id : false,
    });
  }, []);

  const { 
    data: popupData,
    isLoading: isLoadingPopup,
    isFetching: isFetchingPopupData
  } = useQuery<IFetchedPopupData, Error>({
    queryKey: ['nftCoordinates-PostGIS-popup', selectedPopupConfig?.asset_address, selectedPopupConfig?.network, selectedPopupConfig?.token_id, selectedPopupConfig?.type],
    queryFn: async () => {
      if (selectedPopupConfig.asset_address && selectedPopupConfig.network && selectedPopupConfig.token_id && selectedPopupConfig?.type) {
        if(selectedPopupConfig?.type === 'listing') {
          let listingDataResponse = await PropyKeysListingService.getListing(
            selectedPopupConfig.network,
            selectedPopupConfig.asset_address,
            selectedPopupConfig.token_id
          );
          let listingData : IPropyKeysHomeListingRecord = listingDataResponse.data;
          return {
            type: selectedPopupConfig?.type,
            data: listingData,
          }
        } else if(selectedPopupConfig?.type === 'token') {
          let nftDataResponse = await NFTService.getNft(
            selectedPopupConfig.network,
            selectedPopupConfig.asset_address,
            selectedPopupConfig.token_id
          );
          let nftData : INFTRecord = nftDataResponse.data;
          return {
            type: selectedPopupConfig?.type,
            data: nftData,
          }
        }
      }
      return {
        type: "unknown",
        data: null
      };
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: Infinity, // Keep unused data in cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: false, // Don't retry on failure
    enabled: !!selectedPopupConfig.asset_address && !!selectedPopupConfig.network && !!selectedPopupConfig.token_id,
  });

  const loadingSpring = useSpring({
    from: {
      scale: '1',
      opacity: '0.1'
    },
    to: {
      scale: '1.1',
      opacity: '0.6'
    },
    loop: true,
    delay: 100,
    config: config.wobbly,
  })

  const memoizedPopupNode = useMemo(() => {
    if(popupData?.type === 'token') {
      return createTokenPopupNode(popupData.data as INFTRecord);
    } else if (popupData?.type === 'listing') {
      return createListingPopupNode(popupData.data as IPropyKeysHomeListingRecord);
    }
    return null;
  }, [popupData]);

  return (
    <>
    <Card style={{width, height, zIndex: 0, ...(disableBorderRadius && {borderRadius: 0})}}>
      <LeafletMapContainer 
        zoom={zoom}
        zoomControl={zoomControl}
        dragging={dragging}
        doubleClickZoom={doubleClickZoom}
        scrollWheelZoom={scrollWheelZoom}
        markers={nftCoordinatesGIS}
        center={center}
        disableClustering={false}
        onBoundsUpdate={onBoundsUpdate}
        onMarkerSelection={onMarkerSelection}
        isLoading={isLoading || isFetching}
        setPopupOpen={setPopupOpen}
        popupNode={(memoizedPopupNode && !isFetchingPopupData && !isLoadingPopup && !isFetching) ? memoizedPopupNode : 
          isFetching ? null : <div style={{width: 300, height: 300}}>
          <div className={classes.loadingIconContainer}>
            <animated.img style={loadingSpring} className={classes.loadingIcon} src={LogoDarkMode} alt="loading icon" />
          </div>
        </div>
        }
      />
      <AdditionalMapControlOverlayContainer setPopupOpen={setPopupOpen} />
    </Card>
    </>
  )
}

export default memo(PropyKeysMapCardPostGIS);