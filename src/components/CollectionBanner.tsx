import React, { useEffect, useState } from 'react'

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

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

import {
  IAssetRecord,
  INFTRecord,
  IRecentlyMintedResult,
} from '../interfaces';

import {
  NFTService,
} from '../services/api';

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
  firstElementShim?: React.ReactNode
}

interface INftAssets {
  [key: string]: IAssetRecord
}

const CollectionBanner = (props: ICollectionBanner & PropsFromRedux) => {

  const [nftRecords, setNftRecords] = useState<INFTRecord[]>([]);
  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perPage, setPerPage] = useState(20);
  const [paginationTotalPages, setPaginationTotalPages] = useState(0);
  const [title, setTitle] = useState("Loading...");
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
  } = props;

  if(firstElementShim && maxRecords) {
    maxRecords = maxRecords - 1;
  }

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      let collectionResponse = await NFTService.getCollectionPaginated(
        network,
        contractNameOrCollectionNameOrAddress,
        perPage,
        page,
      )
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
              setTitle(useTitle);
            }
            renderResults = [...renderResults, nftRecord];
          }
          if(apiResponseData?.metadata?.pagination?.totalPages) {
            setPaginationTotalPages(apiResponseData?.metadata?.pagination?.totalPages);
          }
        }
        setNftRecords(renderResults);
        setNftAssets(assetResults);
      } else {
        setNftRecords([]);
        setNftAssets({});
      }
    }
    fetchCollection();
    return () => {
      isMounted = false;
    }
  }, [contractNameOrCollectionNameOrAddress, network, perPage, page])

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
        </div>
      }
      <Grid className={classes.sectionSpacer} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
        {!isLoading && nftRecords && firstElementShim && 
          <Grid key={`single-token-card-first-element-shim-${new Date().getTime()}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            {firstElementShim}
          </Grid>
        }
        {!isLoading && nftRecords && nftRecords.sort((a, b) => {
          if(nftAssets[a?.asset_address]?.standard && nftAssets[b?.asset_address]?.standard) {
            return (nftAssets[a?.asset_address]?.standard).localeCompare(nftAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,(maxRecords && (nftRecords.length > maxRecords)) ? maxRecords : nftRecords.length).map((item, index) => 
          <Grid key={`single-token-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard nftRecord={item} assetRecord={nftAssets[item?.asset_address]} />
          </Grid>
        )}
        {isLoading && maxRecords &&
          Array.from({length: maxRecords}).map((entry, index) => 
            <Grid key={`single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
              <SingleTokenCardLoading />
            </Grid>
          )
        }
      </Grid>
      {paginationTotalPages > 1 && showPagination &&
        <div className={classes.paginationContainer}>
          <Pagination onChange={(event: any, page: number) => setPage(page)} count={paginationTotalPages} variant="outlined" color="primary" />
        </div>
      }
    </>
  )
}

export default CollectionBanner;