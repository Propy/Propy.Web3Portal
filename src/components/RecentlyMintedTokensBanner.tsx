import React, { useEffect, useState, useId } from 'react'

import { useSearchParams } from "react-router-dom";

import { useQuery } from '@tanstack/react-query';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';

import SingleTokenCard from './SingleTokenCard';
import SingleTokenCardLoading from './SingleTokenCardLoading';
import LinkWrapper from './LinkWrapper';

import { PropsFromRedux } from '../containers/RecentlyMintedTokensBannerContainer';

import {
  IRecentlyMintedResult,
  INFTRecord,
  IAssetRecord,
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
    },
    paginationTotalContainer: {
      marginTop: theme.spacing(1),
      display: 'flex',
      justifyContent: 'center',
    },
  }),
);

interface IRecentlyMintedTokensBanner {
  maxRecords?: number
  showTitle?: boolean
  showPagination?: boolean
  showRecentlyMintedLink?: boolean
}

interface IRecentlyMintedTokenAssets {
  [key: string]: IAssetRecord
}

const RecentlyMintedTokensBanner = (props: IRecentlyMintedTokensBanner & PropsFromRedux) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const uniqueId = useId();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
    showPagination = false,
    showRecentlyMintedLink = false,
    isConsideredMobile,
  } = props;

  const perPage = 20;

  const { 
    data: recentlyMintedDataTanstack,
    isLoading: isLoadingRecentlyMintedDataTanstack,
  } = useQuery({
    queryKey: ['recently-minted-banner', perPage, page],
    queryFn: async () => {
      let recentlyMintedResponse = await NFTService.getRecentlyMintedPaginated(
        perPage,
        page,
      )
      if(recentlyMintedResponse?.status && recentlyMintedResponse?.data) {
        let renderResults : INFTRecord[] = [];
        let assetResults : IRecentlyMintedTokenAssets = {};
        let apiResponseData : IRecentlyMintedResult = recentlyMintedResponse.data;
        if(recentlyMintedResponse?.status && apiResponseData?.data) {
          for(let nftRecord of apiResponseData?.data) {
            if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
              assetResults[nftRecord.asset.address] = nftRecord.asset;
            }
            renderResults = [...renderResults, nftRecord];
          }
        }
        return {
          nftRecords: renderResults,
          nftAssets: assetResults,
          pagination: {
            totalPages: apiResponseData?.metadata?.pagination?.totalPages ? apiResponseData?.metadata?.pagination?.totalPages : 0,
            totalRecords: apiResponseData?.metadata?.pagination?.total ? apiResponseData?.metadata?.pagination?.total : 0,
          }
        }
      } else {
        return {
          nftRecords: [],
          nftAssets: {},
          pagination: {
            totalPages: 0,
            totalRecords: 0,
          }
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
        <div className={[classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
          <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
            Recently Minted Assets
          </Typography>
          {showRecentlyMintedLink && 
            <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link="recently-minted">
              <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                View recently minted assets
              </Button>
            </LinkWrapper>
          }
        </div>
      }
      <Grid className={classes.sectionSpacer} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
          {!isLoadingRecentlyMintedDataTanstack && recentlyMintedDataTanstack?.nftRecords && recentlyMintedDataTanstack.nftRecords.sort((a, b) => {
            if(recentlyMintedDataTanstack?.nftAssets[a?.asset_address]?.standard && recentlyMintedDataTanstack.nftAssets[b?.asset_address]?.standard) {
              return (recentlyMintedDataTanstack.nftAssets[a?.asset_address]?.standard).localeCompare(recentlyMintedDataTanstack.nftAssets[b?.asset_address]?.standard);
            }
            return 0;
          }).slice(0,(maxRecords && (recentlyMintedDataTanstack.nftRecords.length > maxRecords)) ? maxRecords : recentlyMintedDataTanstack.nftRecords.length).map((item, index) => 
            <Grid key={`${uniqueId}-single-token-card-${index}-${item.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
              <SingleTokenCard nftRecord={item} assetRecord={recentlyMintedDataTanstack.nftAssets[item?.asset_address]} />
            </Grid>
          )}
          {isLoadingRecentlyMintedDataTanstack && maxRecords &&
            Array.from({length: maxRecords}).map((entry, index) => 
              <Grid key={`${uniqueId}-single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                <SingleTokenCardLoading />
              </Grid>
            )
          }
        </Grid>
        {recentlyMintedDataTanstack?.pagination?.totalPages && (recentlyMintedDataTanstack?.pagination?.totalPages > 1) && showPagination &&
          <div className={classes.paginationContainer}>
            <Pagination page={page} onChange={(event: any, page: number) => setPage(page)} count={recentlyMintedDataTanstack?.pagination.totalPages} variant="outlined" color="primary" />
          </div>
        }
    </>
  )
}

export default RecentlyMintedTokensBanner;