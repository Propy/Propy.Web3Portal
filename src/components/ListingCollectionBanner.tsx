import React, { useState, useId, useMemo } from 'react'

import { useLocation, useSearchParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';

import SingleListingCard from './SingleListingCard';
import SingleListingCardLoading from './SingleListingCardLoading';
import LinkWrapper from './LinkWrapper';
import HomeListingCollectionFilterZoneContainer from '../containers/HomeListingCollectionFilterZoneContainer';
import PropyKeysActiveFiltersZoneContainer from '../containers/PropyKeysActiveFiltersZoneContainer';

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

import {
  IAssetRecord,
  IPropyKeysHomeListingRecord,
  ICollectionQueryFilter,
  IListingCollectionResult,
} from '../interfaces';

import {
  PropyKeysListingService,
} from '../services/api';

import {
  VALID_HOME_LISTING_COLLECTION_NAMES_OR_ADDRESSES,
  LISTING_COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'space-between',
    },
    titleContainerWithFilters: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'flex-start',
    },
    title: {
      fontWeight: '500',
      // color: 'white',
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    paginationTotalContainer: {
      marginTop: theme.spacing(1),
      display: 'flex',
      justifyContent: 'center',
    },
    loadingZone: {
      opacity: 0.5,
    },
    filterButton: {
      display: 'flex',
    },
    filterButtonSpacing: {
      marginLeft: theme.spacing(2),
    },
    activeFilterZone: {
      marginBottom: theme.spacing(1),
    }
  }),
);

interface ICollectionBanner {
  maxRecords?: number
  showTitle?: boolean
  showCollectionLink?: boolean
  contractNameOrCollectionNameOrAddress: string
  network: string
  collectionSlug: string
  title?: string
  showPagination?: boolean
  showFilters?: boolean,
  overrideTitle?: string,
  filterShims?: string[]
}

interface INftAssets {
  [key: string]: IAssetRecord
}

const ListingCollectionBanner = (props: ICollectionBanner & PropsFromRedux) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const uniqueId = useId();

  const location = useLocation();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
    showCollectionLink = false,
    network,
    contractNameOrCollectionNameOrAddress,
    collectionSlug,
    showPagination = false,
    isConsideredMobile,
    showFilters = false,
    overrideTitle,
    filterShims,
  } = props;

  const searchParamsMemo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  }, [location.search]);

  const perPage = 20;

  const { 
    data: collectionDataTanstack,
    isLoading: isLoadingCollectionDataTanstack,
  } = useQuery({
    queryKey: ['listing-banner', contractNameOrCollectionNameOrAddress, network, perPage, page, setSearchParams, searchParamsMemo, filterShims, overrideTitle],
    queryFn: async () => {
      let additionalFilters : ICollectionQueryFilter[] = [];
      if(searchParams.get("city")) {
        additionalFilters.push({filter_type: "city", value: `${searchParams.get("city")}`});
      }
      if(searchParams.get("country")) {
        additionalFilters.push({filter_type: "country", value: `${searchParams.get("country")}`});
      }
      if(searchParams.get("min_price")) {
        additionalFilters.push({filter_type: "min_price", value: `${searchParams.get("min_price")}`});
      }
      if(searchParams.get("max_price")) {
        additionalFilters.push({filter_type: "max_price", value: `${searchParams.get("max_price")}`});
      }
      if(searchParams.get("min_bathrooms")) {
        additionalFilters.push({filter_type: "min_bathrooms", value: `${searchParams.get("min_bathrooms")}`});
      }
      if(searchParams.get("min_bedrooms")) {
        additionalFilters.push({filter_type: "min_bedrooms", value: `${searchParams.get("min_bedrooms")}`});
      }
      if(searchParams.get("min_lot_size")) {
        additionalFilters.push({filter_type: "min_lot_size", value: `${searchParams.get("min_lot_size")}`});
      }
      let collectionResponse = await PropyKeysListingService.getCollectionPaginated(
        network,
        contractNameOrCollectionNameOrAddress,
        perPage,
        page,
        additionalFilters,
      )
      let title = "No records found";
      let nftAddress = "";
      if(collectionResponse?.status && collectionResponse?.data) {
        let renderResults : IPropyKeysHomeListingRecord[] = [];
        let assetResults : INftAssets = {};
        let apiResponseData : IListingCollectionResult = collectionResponse.data;
        if(collectionResponse?.status && apiResponseData?.data) {
          for(let listingRecord of apiResponseData?.data) {
            if(listingRecord?.asset_address && !assetResults[listingRecord?.asset_address]) {
              title = "Collection not found";
              if(listingRecord.collection_name) {
                title = listingRecord.collection_name;
              } else if (listingRecord.asset_address) {
                title = listingRecord.asset_address;
              }
              if(overrideTitle) {
                title = overrideTitle;
              }
              let matchedEntry = LISTING_COLLECTIONS_PAGE_ENTRIES.find((entry) => [entry.slug, entry.address].indexOf(contractNameOrCollectionNameOrAddress) > -1);
              if(matchedEntry?.overrideTitle) {
                title = matchedEntry?.overrideTitle;
              }
              if(matchedEntry?.address) {
                nftAddress = matchedEntry?.address;
              }
            }
            renderResults = [...renderResults, listingRecord];
          }
        }
        return {
          title,
          listingRecords: renderResults,
          nftAssets: assetResults,
          nftAddress,
          activeFilters: additionalFilters,
          pagination: {
            totalPages: apiResponseData?.metadata?.pagination?.totalPages ? apiResponseData?.metadata?.pagination?.totalPages : 0,
            totalRecords: apiResponseData?.metadata?.pagination?.total ? apiResponseData?.metadata?.pagination?.total : 0,
          }
        }
      }
      return {
        title,
        listingRecords: [],
        nftAssets: {},
        nftAddress,
        activeFilters: [],
        pagination: {
          totalPages: 0,
          totalRecords: 0,
        }
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  return (
    <>
      {showTitle &&
        <>
          <div className={[showFilters ? classes.titleContainerWithFilters : classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
            <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
              {collectionDataTanstack?.title ? collectionDataTanstack?.title : "Loading..."}
            </Typography>
            {showCollectionLink && collectionDataTanstack && 
              <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link={`listings/${network}/${collectionSlug}`}>
                <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                  View {collectionDataTanstack.title}
                </Button>
              </LinkWrapper>
            }
            {
              showFilters &&
              collectionDataTanstack &&
              (VALID_HOME_LISTING_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
                <div className={[isConsideredMobile ? "" : classes.filterButtonSpacing, classes.filterButton].join(" ")}>
                  <HomeListingCollectionFilterZoneContainer
                    nftContractAddress={collectionDataTanstack?.nftAddress}
                    collectionSlug={collectionSlug}
                    contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress}
                    network={network}
                    isLoading={isLoadingCollectionDataTanstack}
                    setPage={setPage}
                  />
                </div>
            }
          </div>
          {
            showFilters &&
            collectionDataTanstack &&
            (VALID_HOME_LISTING_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
            (collectionDataTanstack?.activeFilters.length > 0) &&
              <div className={classes.activeFilterZone}>
                <PropyKeysActiveFiltersZoneContainer activeFilters={collectionDataTanstack?.activeFilters} />
              </div>
          }
        </>
      }
      <Grid className={[classes.sectionSpacer, isLoadingCollectionDataTanstack ? classes.loadingZone : ''].join(" ")} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 40 }}>
        {collectionDataTanstack?.listingRecords && collectionDataTanstack?.listingRecords.sort((a, b) => {
          if(collectionDataTanstack?.nftAssets[a?.asset_address]?.standard && collectionDataTanstack?.nftAssets[b?.asset_address]?.standard) {
            return (collectionDataTanstack?.nftAssets[a?.asset_address]?.standard).localeCompare(collectionDataTanstack?.nftAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,(maxRecords && (collectionDataTanstack?.listingRecords.length > maxRecords)) ? maxRecords : collectionDataTanstack?.listingRecords.length).map((item, index) => 
          <Grid key={`${uniqueId}-single-listing-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={10}>
            <SingleListingCard listingCollectionName={collectionDataTanstack?.title} listingRecord={item} assetRecord={collectionDataTanstack?.nftAssets[item?.asset_address]} />
          </Grid>
        )}
        {isLoadingCollectionDataTanstack && maxRecords &&
          Array.from({length: maxRecords}).map((entry, index) => 
            <Grid key={`${uniqueId}-single-listing-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={10}>
              <SingleListingCardLoading />
            </Grid>
          )
        }
      </Grid>
      {collectionDataTanstack?.pagination?.totalPages && collectionDataTanstack?.pagination?.totalPages > 1 && showPagination &&
        <>
          <div className={classes.paginationContainer}>
            <Pagination page={page} onChange={(event: any, page: number) => setPage(page)} count={collectionDataTanstack?.pagination?.totalPages} variant="outlined" color="primary" />
          </div>
          {
            collectionDataTanstack?.pagination?.totalRecords &&
            <Typography variant="subtitle1" className={classes.paginationTotalContainer}>
              {collectionDataTanstack?.pagination?.totalRecords} total records
            </Typography>
          }
        </>
      }
    </>
  )
}

export default ListingCollectionBanner;