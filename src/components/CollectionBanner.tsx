import React, { useEffect, useState } from 'react'

import { useSearchParams } from "react-router-dom";

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'space-between',
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
  filterShims?: string[]
}

interface INftAssets {
  [key: string]: IAssetRecord
}

const CollectionBanner = (props: ICollectionBanner & PropsFromRedux) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const [nftRecords, setNftRecords] = useState<INFTRecord[]>([]);
  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perPage, setPerPage] = useState(20);
  const [paginationTotalPages, setPaginationTotalPages] = useState(0);
  const [paginationTotalRecords, setPaginationTotalRecords] = useState(0);
  const [title, setTitle] = useState("Loading...");
  const [isInitialLoad, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
  } = props;

  if(firstElementShim && maxRecords) {
    maxRecords = maxRecords - 1;
  }

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
      if(searchParams.get("owner")) {
        additionalFilters.push({filter_type: "owner", value: `${searchParams.get("owner")}`});
      }
      if(searchParams.get("status")) {
        additionalFilters.push({filter_type: "status", value: `${searchParams.get("status")}`});
      }
      if(searchParams.get("landmark") || (filterShims && filterShims.indexOf("landmark") > -1)) {
        additionalFilters.push({filter_type: "landmark", value: true});
      }
      if(searchParams.get("attached_deed")) {
        additionalFilters.push({filter_type: "attached_deed", value: true});
      }
      let collectionResponse = await NFTService.getCollectionPaginated(
        network,
        contractNameOrCollectionNameOrAddress,
        perPage,
        page,
        additionalFilters,
      )
      setIsInitialLoading(false);
      setIsLoading(false);
      if(collectionResponse?.status && collectionResponse?.data && isMounted) {
        let renderResults : INFTRecord[] = [];
        let assetResults : INftAssets = {};
        let apiResponseData : IRecentlyMintedResult = collectionResponse.data;
        if(collectionResponse?.status && apiResponseData?.data) {
          for(let nftRecord of apiResponseData?.data) {
            if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
              assetResults[nftRecord.asset.address] = nftRecord.asset;
              let useTitle = "Collection not found";
              if(nftRecord.asset.collection_name) {
                useTitle = nftRecord.asset.collection_name;
              } else if (nftRecord.asset.name) {
                useTitle = nftRecord.asset.name;
              } else if (nftRecord.asset.address) {
                useTitle = nftRecord.asset.address;
              }
              if(overrideTitle) {
                useTitle = overrideTitle;
              }
              setTitle(useTitle);
            }
            renderResults = [...renderResults, nftRecord];
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
        setNftRecords(renderResults);
        setNftAssets(assetResults);
      } else {
        setNftRecords([]);
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
        <div className={[classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
          <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
            {title ? title : "Loading..."}
          </Typography>
          {showCollectionLink && 
            <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link={`collection/${network}/${collectionSlug}`}>
              <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                View {title}
              </Button>
            </LinkWrapper>
          }
          {
            showFilters &&
            (VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES.indexOf(collectionSlug) > -1) &&
              <PropyKeysCollectionFilterZoneContainer
                collectionSlug={collectionSlug}
                contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress}
                network={network}
                isLoading={isLoading}
              />
          }
        </div>
      }
      <Grid className={[classes.sectionSpacer, isLoading ? classes.loadingZone : ''].join(" ")} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
        {!isInitialLoad && nftRecords && firstElementShim && 
          <Grid key={`single-token-card-first-element-shim-${new Date().getTime()}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            {firstElementShim}
          </Grid>
        }
        {!isInitialLoad && nftRecords && nftRecords.sort((a, b) => {
          if(nftAssets[a?.asset_address]?.standard && nftAssets[b?.asset_address]?.standard) {
            return (nftAssets[a?.asset_address]?.standard).localeCompare(nftAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,(maxRecords && (nftRecords.length > maxRecords)) ? maxRecords : nftRecords.length).map((item, index) => 
          <Grid key={`single-token-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard nftRecord={item} assetRecord={nftAssets[item?.asset_address]} />
          </Grid>
        )}
        {isInitialLoad && maxRecords &&
          Array.from({length: maxRecords}).map((entry, index) => 
            <Grid key={`single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
              <SingleTokenCardLoading />
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

export default CollectionBanner;