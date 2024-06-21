import React, { useEffect, useState } from 'react'

import { useSearchParams } from "react-router-dom";

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

  const [listingRecords, setListingRecords] = useState<IPropyKeysHomeListingRecord[]>([]);
  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perPage, setPerPage] = useState(20);
  const [paginationTotalPages, setPaginationTotalPages] = useState(0);
  const [paginationTotalRecords, setPaginationTotalRecords] = useState(0);
  const [title, setTitle] = useState("Loading...");
  const [isInitialLoad, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ICollectionQueryFilter[]>([]);
  const [nftAddress, setNftAddress] = useState<string>("");

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

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      setIsLoading(true);
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
      setActiveFilters(additionalFilters);
      console.log({contractNameOrCollectionNameOrAddress})
      let collectionResponse = await PropyKeysListingService.getCollectionPaginated(
        network,
        contractNameOrCollectionNameOrAddress,
        perPage,
        page,
        additionalFilters,
      )
      setIsInitialLoading(false);
      setIsLoading(false);
      console.log({collectionResponse})
      if(collectionResponse?.status && collectionResponse?.data && isMounted) {
        let renderResults : IPropyKeysHomeListingRecord[] = [];
        let assetResults : INftAssets = {};
        let apiResponseData : IListingCollectionResult = collectionResponse.data;
        if(collectionResponse?.status && apiResponseData?.data) {
          for(let listingRecord of apiResponseData?.data) {
            if(listingRecord?.asset_address && !assetResults[listingRecord?.asset_address]) {
              let useTitle = "Collection not found";
              if(listingRecord.collection_name) {
                useTitle = listingRecord.collection_name;
              } else if (listingRecord.asset_address) {
                useTitle = listingRecord.asset_address;
              }
              if(overrideTitle) {
                useTitle = overrideTitle;
              }
              let matchedEntry = LISTING_COLLECTIONS_PAGE_ENTRIES.find((entry) => [entry.slug, entry.address].indexOf(contractNameOrCollectionNameOrAddress) > -1);
              if(matchedEntry?.overrideTitle) {
                useTitle = matchedEntry?.overrideTitle;
              }
              if(matchedEntry?.address) {
                setNftAddress(matchedEntry?.address);
              }
              setTitle(useTitle);
              
            }
            renderResults = [...renderResults, listingRecord];
          }
          if(apiResponseData?.metadata?.pagination?.totalPages) {
            setPaginationTotalPages(apiResponseData?.metadata?.pagination?.totalPages);
          } else {
            setPaginationTotalPages(0);
          }
          if(apiResponseData?.metadata?.pagination?.total) {
            setPaginationTotalRecords(apiResponseData?.metadata?.pagination?.total);
          } else {
            setPaginationTotalRecords(0);
          }
        }
        if(renderResults.length === 0) {
          setTitle("No records found");
        }
        setListingRecords(renderResults);
        setNftAssets(assetResults);
      } else {
        setListingRecords([]);
        setNftAssets({});
      }
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
    }
    fetchCollection();
    return () => {
      isMounted = false;
    }
  }, [contractNameOrCollectionNameOrAddress, network, perPage, page, setSearchParams, searchParams, filterShims, overrideTitle])

  return (
    <>
      {showTitle &&
        <>
          <div className={[showFilters ? classes.titleContainerWithFilters : classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
            <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
              {title ? title : "Loading..."}
            </Typography>
            {showCollectionLink && 
              <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link={`listings/${network}/${collectionSlug}`}>
                <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                  View {title}
                </Button>
              </LinkWrapper>
            }
            {
              showFilters &&
              (VALID_HOME_LISTING_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
                <div className={[isConsideredMobile ? "" : classes.filterButtonSpacing, classes.filterButton].join(" ")}>
                  <HomeListingCollectionFilterZoneContainer
                    nftContractAddress={nftAddress}
                    collectionSlug={collectionSlug}
                    contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress}
                    network={network}
                    isLoading={isLoading}
                    setPage={setPage}
                  />
                </div>
            }
          </div>
          {
            showFilters &&
            (VALID_HOME_LISTING_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
            (activeFilters.length > 0) &&
              <div className={classes.activeFilterZone}>
                <PropyKeysActiveFiltersZoneContainer activeFilters={activeFilters} />
              </div>
          }
        </>
      }
      <Grid className={[classes.sectionSpacer, isLoading ? classes.loadingZone : ''].join(" ")} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 40 }}>
        {!isInitialLoad && listingRecords && listingRecords.sort((a, b) => {
          if(nftAssets[a?.asset_address]?.standard && nftAssets[b?.asset_address]?.standard) {
            return (nftAssets[a?.asset_address]?.standard).localeCompare(nftAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,(maxRecords && (listingRecords.length > maxRecords)) ? maxRecords : listingRecords.length).map((item, index) => 
          <Grid key={`single-listing-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={10}>
            <SingleListingCard listingCollectionName={title} listingRecord={item} assetRecord={nftAssets[item?.asset_address]} />
          </Grid>
        )}
        {isInitialLoad && maxRecords &&
          Array.from({length: maxRecords}).map((entry, index) => 
            <Grid key={`single-listing-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={10}>
              <SingleListingCardLoading />
            </Grid>
          )
        }
      </Grid>
      {paginationTotalPages > 1 && showPagination &&
        <>
          <div className={classes.paginationContainer}>
            <Pagination page={page} onChange={(event: any, page: number) => setPage(page)} count={paginationTotalPages} variant="outlined" color="primary" />
          </div>
          {
            paginationTotalRecords &&
            <Typography variant="subtitle1" className={classes.paginationTotalContainer}>
              {paginationTotalRecords} total records
            </Typography>
          }
        </>
      }
    </>
  )
}

export default ListingCollectionBanner;