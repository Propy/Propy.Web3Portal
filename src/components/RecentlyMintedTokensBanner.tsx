import React, { useEffect, useState } from 'react'

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

  const [nftRecords, setNftRecords] = useState<INFTRecord[]>([]);
  const [nftAssets, setNftAssets] = useState<IRecentlyMintedTokenAssets>({});
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perPage, setPerPage] = useState(20);
  const [paginationTotalPages, setPaginationTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
    showPagination = false,
    showRecentlyMintedLink = false,
    isConsideredMobile,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const fetchMixedTokens = async () => {
      let recentlyMintedResponse = await NFTService.getRecentlyMintedPaginated(
        perPage,
        page,
      )
      setIsLoading(false);
      if(recentlyMintedResponse?.status && recentlyMintedResponse?.data && isMounted) {
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
    fetchMixedTokens();
    return () => {
      isMounted = false;
    }
  }, [perPage, page])

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

export default RecentlyMintedTokensBanner;