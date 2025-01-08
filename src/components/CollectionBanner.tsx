import React, { useEffect, useState, useMemo, useId } from 'react'

import { useLocation, useSearchParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';

import SingleTokenCard from './SingleTokenCard';
import SingleTokenCardLoading from './SingleTokenCardLoading';
import LinkWrapper from './LinkWrapper';
import PropyKeysCollectionFilterZoneContainer from '../containers/PropyKeysCollectionFilterZoneContainer';
import PropyKeysActiveFiltersZoneContainer from '../containers/PropyKeysActiveFiltersZoneContainer';

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

import {
  IAssetRecord,
  INFTRecord,
  IRecentlyMintedResult,
  ICollectionQueryFilter,
} from '../interfaces';

import {
  NFTService,
} from '../services/api';

import {
  VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES,
} from '../utils/constants';
import CollectionExplorerGalleryContainer from '../containers/CollectionExplorerGalleryContainer';

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
    },
    collectionExplorerGalleryContainer: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(2),
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
  firstElementShim?: React.ReactNode,
  showFilters?: boolean,
  overrideTitle?: string,
  filterShims?: string[],
  showHeroGallery?: boolean,
  sortBy?: "most_liked",
}

interface INftAssets {
  [key: string]: IAssetRecord
}

const CollectionBanner = (props: ICollectionBanner & PropsFromRedux) => {

  const uniqueId = useId();

  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  
  const searchParamsMemo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  }, [location.search]);

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
    firstElementShim,
    showFilters = false,
    overrideTitle,
    filterShims,
    showHeroGallery = false,
    sortBy,
  } = props;

  if(firstElementShim && maxRecords) {
    maxRecords = maxRecords - 1;
  }

  const perPage = 20;

  const { 
    data: collectionDataTanstack,
    isLoading: isLoadingCollectionDataTanstack,
  } = useQuery({
    queryKey: ['collection-banner', contractNameOrCollectionNameOrAddress, network, perPage, page, searchParamsMemo, filterShims, overrideTitle, sortBy],
    queryFn: async () => {
      let additionalFilters : ICollectionQueryFilter[] = [];
      if(searchParams.get("city")) {
        additionalFilters.push({filter_type: "city", value: `${searchParams.get("city")}`});
      }
      if(searchParams.get("country")) {
        additionalFilters.push({filter_type: "country", value: `${searchParams.get("country")}`});
      }
      if(searchParams.get("owner")) {
        additionalFilters.push({filter_type: "owner", value: `${searchParams.get("owner")}`});
      }
      if(searchParams.get("status")) {
        additionalFilters.push({filter_type: "status", value: `${searchParams.get("status")}`});
      }
      if(searchParams.get("landmark") || (filterShims && filterShims.indexOf("landmark") > -1)) {
        additionalFilters.push({filter_type: "landmark", value: true});
      }
      if(searchParams.get("attached_deed") || (filterShims && filterShims.indexOf("attached_deed") > -1)) {
        additionalFilters.push({filter_type: "attached_deed", value: true});
      }
      if(sortBy) {
        additionalFilters.push({filter_type: "sort_by", value: sortBy});
      } else if(searchParams.get("sort_by")) {
        additionalFilters.push({filter_type: "sort_by", value: `${searchParams.get("sort_by")}`});
      }
      let collectionResponse = await NFTService.getCollectionPaginated(
        network,
        contractNameOrCollectionNameOrAddress,
        perPage,
        page,
        additionalFilters,
      )
      let title = "No records found";
      if(collectionResponse?.status && collectionResponse?.data) {
        let renderResults : INFTRecord[] = [];
        let assetResults : INftAssets = {};
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
          nftRecords: renderResults,
          nftAssets: assetResults,
          activeFilters: additionalFilters,
          pagination: {
            totalPages: apiResponseData?.metadata?.pagination?.totalPages ? apiResponseData?.metadata?.pagination?.totalPages : 0,
            totalRecords: apiResponseData?.metadata?.pagination?.total ? apiResponseData?.metadata?.pagination?.total : 0,
          }
        }
      }
      return {
        title,
        nftRecords: [],
        nftAssets: {},
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

  useEffect(() => {
    if(page > 1) {
      setSearchParams((params => {
        params.set("page", page.toString());
        return params;
      }));
    } else if(searchParams.get("page")) {
      setSearchParams((params => {
        params.delete("page");
        return params;
      }));
    }
  }, [page, searchParams, setSearchParams]);

  return (
    <>
      {showTitle &&
        <>
          <div className={[showFilters ? classes.titleContainerWithFilters : classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
            <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
              {collectionDataTanstack?.title ? collectionDataTanstack?.title : "Loading..."}
            </Typography>
            {showCollectionLink && collectionDataTanstack?.title && 
              <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link={`collection/${network}/${collectionSlug}`}>
                <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                  View {collectionDataTanstack?.title}
                </Button>
              </LinkWrapper>
            }
            {
              showFilters &&
              (VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
                <div className={[isConsideredMobile ? "" : classes.filterButtonSpacing, classes.filterButton].join(" ")}>
                  <PropyKeysCollectionFilterZoneContainer
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
            (VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
            (collectionDataTanstack?.activeFilters && collectionDataTanstack?.activeFilters.length > 0) &&
              <div className={classes.activeFilterZone}>
                <PropyKeysActiveFiltersZoneContainer activeFilters={collectionDataTanstack?.activeFilters} />
              </div>
          }
        </>
      }
      {showHeroGallery && 
        <div className={classes.collectionExplorerGalleryContainer}>
          <CollectionExplorerGalleryContainer 
            explorerEntries={
              collectionDataTanstack?.nftRecords ? collectionDataTanstack?.nftRecords.map((item, index) => ({
                type: "NFT",
                nftRecord: item,
                collectionRecord: collectionDataTanstack?.nftAssets[item?.asset_address],
              })) : []
            }
            fullWidth={true}
            overrideTitle={overrideTitle}
            overrideSlug={collectionSlug}
            isLoading={isLoadingCollectionDataTanstack}
          />
        </div>
      }
      <Grid className={[classes.sectionSpacer, isLoadingCollectionDataTanstack ? classes.loadingZone : ''].join(" ")} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
        {!isLoadingCollectionDataTanstack && collectionDataTanstack?.nftRecords && firstElementShim && 
          <Grid key={`${uniqueId}-single-token-card-first-element-shim-${new Date().getTime()}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            {firstElementShim}
          </Grid>
        }
        {!isLoadingCollectionDataTanstack && collectionDataTanstack?.nftRecords && collectionDataTanstack?.nftRecords.sort((a, b) => {
          if(collectionDataTanstack?.nftAssets[a?.asset_address]?.standard && collectionDataTanstack?.nftAssets[b?.asset_address]?.standard) {
            return (collectionDataTanstack?.nftAssets[a?.asset_address]?.standard).localeCompare(collectionDataTanstack?.nftAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,(maxRecords && (collectionDataTanstack?.nftRecords.length > maxRecords)) ? maxRecords : collectionDataTanstack?.nftRecords.length).map((item, index) => 
          <Grid key={`${uniqueId}-single-token-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard nftRecord={item} assetRecord={collectionDataTanstack?.nftAssets[item?.asset_address]} />
          </Grid>
        )}
        {isLoadingCollectionDataTanstack && maxRecords &&
          Array.from({length: maxRecords}).map((entry, index) => 
            <Grid key={`${uniqueId}-single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
              <SingleTokenCardLoading />
            </Grid>
          )
        }
      </Grid>
      {collectionDataTanstack?.pagination && collectionDataTanstack?.pagination?.totalPages > 1 && showPagination &&
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

export default CollectionBanner;