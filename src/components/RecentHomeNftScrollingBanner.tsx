import React from 'react'

import { useQuery } from '@tanstack/react-query';

import {
  IRecentlyMintedResult,
  IHorizontalScrollingTextEntry,
} from '../interfaces';

import {
  NFTService,
} from '../services/api';

import {
  COLLECTIONS_PAGE_ENTRIES
} from '../utils/constants';

import HorizontalScrollingTextBannerContainer from '../containers/HorizontalScrollingTextBannerContainer';

let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === (process?.env?.REACT_APP_ENV === 'prod' ? 'propykeys' : 'propy-home-nft-dev-base-testnet'));

let maxScrollingEntries = 8;

let maxTimeframeMinutesSinceMinted = 60;

const RecentHomeNftScrollingBanner = () => {

  const { 
    data: scrollingTextEntriesTanstack,
  } = useQuery({
    queryKey: ['latest-propykey-mint-scroller'],
    queryFn: async () => {
      let entries : IHorizontalScrollingTextEntry[] = [];
      if(collectionConfigEntry) {
        let collectionResponse = await NFTService.getCollectionPaginated(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
          10,
          1,
        )
        if(collectionResponse?.status && collectionResponse?.data) {
          let renderResults : IHorizontalScrollingTextEntry[] = [];
          let apiResponseData : IRecentlyMintedResult = collectionResponse.data;
          if(collectionResponse?.status && apiResponseData?.data) {
            for(let nftRecord of apiResponseData?.data) {
              if(nftRecord.metadata) {
                let parsedMetadata = nftRecord.metadata;
                let cityAttribute = parsedMetadata?.attributes?.find((entry: {trait_type: string, value: string}) => entry.trait_type === 'City');
                let reservationEntryTimeline = parsedMetadata?.timeline?.find((entry) => entry.milestone === 'Reserved');
                let isReservationWithinBannerTimeframe = false;
                if(reservationEntryTimeline && reservationEntryTimeline.date && !isNaN(reservationEntryTimeline.date)) {
                  let secondsSinceMint = (Math.floor(new Date().getTime() / 1000) - Number(reservationEntryTimeline.date))
                  isReservationWithinBannerTimeframe = secondsSinceMint < (60 * maxTimeframeMinutesSinceMinted);
                }
                if(cityAttribute && cityAttribute.value && isReservationWithinBannerTimeframe && (renderResults.length < maxScrollingEntries)) {
                  renderResults.push({string: `New address minted in ${cityAttribute.value}`, link: `token/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`});
                }
              }
            }
          }
          entries = renderResults;
        }
      }
      return {
        entries
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  return (
    <HorizontalScrollingTextBannerContainer entries={scrollingTextEntriesTanstack?.entries ? scrollingTextEntriesTanstack.entries : []} />
  )
}

export default RecentHomeNftScrollingBanner;