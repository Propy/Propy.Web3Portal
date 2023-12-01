import React, { useState, useEffect } from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      overflowX: 'hidden',
    },
  }),
);

let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === (process?.env?.REACT_APP_ENV === 'prod' ? 'propy-home-nft' : 'propy-home-nft-dev-testnet'));

let maxScrollingEntries = 8;

const RecentHomeNftScrollingBanner = () => {

  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(true);
  const [scrollingTextEntries, setScrollingTextEntries] = useState<IHorizontalScrollingTextEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      if(collectionConfigEntry) {
        let collectionResponse = await NFTService.getCollectionPaginated(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
          10,
          1,
        )
        setIsLoading(false);
        console.log({collectionResponse})
        if(collectionResponse?.status && collectionResponse?.data && isMounted) {
          let renderResults : IHorizontalScrollingTextEntry[] = [];
          let apiResponseData : IRecentlyMintedResult = collectionResponse.data;
          if(collectionResponse?.status && apiResponseData?.data) {
            for(let nftRecord of apiResponseData?.data) {
              if(nftRecord.metadata) {
                let parsedMetadata = JSON.parse(nftRecord.metadata);
                if(parsedMetadata.name && (renderResults.length < maxScrollingEntries)) {
                  renderResults.push({string: parsedMetadata.name, link: `token/${nftRecord.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`});
                }
              }
            }
          }
          setScrollingTextEntries(renderResults);
        } else {
          setScrollingTextEntries([]);
        }
      } else {
        setScrollingTextEntries([]);
      }
    }
    fetchCollection();
    return () => {
      isMounted = false;
    }
  }, [])

  return (
    <HorizontalScrollingTextBannerContainer entries={scrollingTextEntries} />
  )
}

export default RecentHomeNftScrollingBanner;