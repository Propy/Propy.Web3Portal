import React, { useState, useId } from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import Card from '@mui/material/Card';

import {
  COLLECTIONS_PAGE_ENTRIES,
  LISTING_COLLECTIONS_PAGE_ENTRIES,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import { useQuery } from '@tanstack/react-query';

import {
  INFTRecord,
  ICollectionRecord,
  IRecentlyMintedResult,
  ICollectionQueryFilter,
  IExplorerGalleryEntry,
  IPropyKeysHomeListingRecord,
} from '../interfaces';

import {
  NFTService,
  PropyKeysListingService,
} from '../services/api';

import { PropsFromRedux } from '../containers/MultiCollectionGalleryContainer';

import CollectionExplorerGalleryContainer from '../containers/CollectionExplorerGalleryContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    collectionEntries: {
      width: '100%',
      overflowX: 'scroll',
      whiteSpace: 'nowrap',
    },
    collectionEntryOption: {
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      display: 'inline-block',
    },
    collectionEntryOptionRightMargin: {
      marginRight: theme.spacing(2),
    },
    selectedCollectionEntryOption: {
      backgroundColor: `${PROPY_LIGHT_BLUE}`,
      color: 'white',
    },
    unselectedCollectionEntryOption: {
      // border: `2px solid transparent`,
      cursor: 'pointer',
    },
    title: {
      fontWeight: '500',
      marginBottom: theme.spacing(2),
    },
  }),
);

const multiGalleryCollectionEntries = [...COLLECTIONS_PAGE_ENTRIES.filter((entry) => entry.showInMultiCollectionGallery), ...LISTING_COLLECTIONS_PAGE_ENTRIES.filter((entry) => entry.showInMultiCollectionGallery)];

interface IMultiCollectionGallery {

}

const MultiCollectionGallery = (props: PropsFromRedux & IMultiCollectionGallery) => {

  const classes = useStyles();

  const uniqueId = useId();

  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0);
  const [resetIndex, setResetIndex] = useState(0);

  const {
    isConsideredMobile,
  } = props;

  const perPage = 20;

  const {
    address,
    network,
    overrideTitle,
    optimisticTitle,
    slug,
    collectionType,
  } = multiGalleryCollectionEntries[selectedCollectionIndex]

  const { 
    data: collectionDataTanstack,
    isLoading: isLoadingCollectionDataTanstack,
  } = useQuery({
    queryKey: ['multi-collection-gallery', address, network, slug, overrideTitle, collectionType],
    queryFn: async () => {
      let additionalFilters : ICollectionQueryFilter[] = [];
      additionalFilters.push({filter_type: "sort_by", value: "most_liked"});
      let title = "No records found";
      if(collectionType === "NFT") {
        let collectionResponse = await NFTService.getCollectionPaginated(
          network,
          address,
          perPage,
          1,
          additionalFilters,
        )
        if(collectionResponse?.status && collectionResponse?.data) {
          let renderResults : INFTRecord[] = [];
          let assetResults : {[key: string]: ICollectionRecord} = {};
          let apiResponseData : IRecentlyMintedResult = collectionResponse.data;
          if(collectionResponse?.status && apiResponseData?.data) {
            for(let nftRecord of apiResponseData?.data) {
              if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
                assetResults[nftRecord.asset.address] = nftRecord.asset;
                title = "Collection not found";
                if(nftRecord.asset.collection_name) {
                  title = nftRecord.asset.collection_name;
                } else if (nftRecord.asset.name) {
                  title = nftRecord.asset.name;
                } else if (nftRecord.asset.address) {
                  title = nftRecord.asset.address;
                }
                if(overrideTitle) {
                  title = overrideTitle;
                }
              }
              renderResults = [...renderResults, nftRecord];
            }
          }
          return {
            title,
            collectionType,
            nftRecords: renderResults,
            collectionRecord: assetResults,
            activeFilters: additionalFilters,
            listingRecords: [],
          }
        }
      } else if (collectionType === "LISTING") {
        let renderResults : IPropyKeysHomeListingRecord[] = [];
        let title = optimisticTitle ? optimisticTitle : "No records found";
        let collectionResponse = await PropyKeysListingService.getCollectionPaginated(
          network,
          slug,
          perPage,
          1,
          additionalFilters,
        )
        if(collectionResponse?.status && collectionResponse?.data?.data) {
          for(let listing of collectionResponse?.data?.data) {
            renderResults.push(listing);
          }
        }
        return {
          title,
          collectionType,
          listingRecords: renderResults,
          nftRecords: [],
          collectionRecord: {
            slug,
            name: title,
            collection_name: title,
          },
          activeFilters: additionalFilters,
        }
      }
      return {
        title,
        collectionType,
        nftRecords: [],
        listingRecords: [],
        collectionRecord: {},
        activeFilters: [],
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  let explorerEntries : IExplorerGalleryEntry[] = [];
  if(collectionDataTanstack?.collectionType === "NFT") {
    explorerEntries = collectionDataTanstack?.nftRecords ? collectionDataTanstack?.nftRecords.map((item, index) => ({
      type: "NFT",
      nftRecord: item,
      collectionRecord: collectionDataTanstack?.collectionRecord[item?.asset_address],
    })) : []
  } else if (collectionDataTanstack?.collectionType === "LISTING") {
    explorerEntries = collectionDataTanstack?.listingRecords ? collectionDataTanstack?.listingRecords.map((item, index) => ({
      type: "LISTING",
      listingRecord: item,
      collectionRecord: collectionDataTanstack?.collectionRecord,
    })) : []
  }

  return (
    <div>
      <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
        Top Rated Collection Items
      </Typography>
      <div className={classes.root}>
        <div className={classes.collectionEntries}>
          {multiGalleryCollectionEntries.map((item, index) => {
            return (
              <Card 
                onClick={() => {setSelectedCollectionIndex(index);setResetIndex(resetIndex + 1)}}
                className={[classes.collectionEntryOption, index === selectedCollectionIndex ? classes.selectedCollectionEntryOption : classes.unselectedCollectionEntryOption, index < multiGalleryCollectionEntries.length - 1 ? classes.collectionEntryOptionRightMargin : ""].join(" ")} 
                key={`${uniqueId}-multi-collection-${item.address}-${index}`}>
                <Typography variant={"h6"}>{item.optimisticTitle}</Typography>
              </Card>
            )
          })}
        </div>
        <CollectionExplorerGalleryContainer
          key={`multi-collection-gallery-${uniqueId}-${resetIndex}`}
          explorerEntries={explorerEntries}
          fullWidth={true}
          overrideTitle={collectionDataTanstack?.title ? collectionDataTanstack?.title : optimisticTitle}
          overrideSlug={slug}
          isLoading={isLoadingCollectionDataTanstack}
        />
      </div>
    </div>
  )
}

export default MultiCollectionGallery;