import React, { useEffect, useState } from 'react'

import { useSearchParams } from "react-router-dom";

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

import { PropsFromRedux } from '../containers/AccountTokensBannerContainer';

import {
  IBalanceRecord,
  IAssetRecord,
  IOwnedBalancesResult,
} from '../interfaces';

import {
  AccountBalanceService,
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
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
  }),
);

interface IAccountTokensBanner {
  maxRecords?: number
  showTitle?: boolean
  account: string
  showPagination?: boolean
}

interface IAllTokenAssets {
  [key: string]: IAssetRecord
}

const AccountTokensBanner = (props: IAccountTokensBanner & PropsFromRedux) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const [ownedTokenBalances, setOwnedTokenBalances] = useState<IBalanceRecord[]>([]);
  const [ownedTokenAssets, setOwnedTokenAssets] = useState<IAllTokenAssets>({});
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perPage, setPerPage] = useState(20);
  const [paginationTotalPages, setPaginationTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
    account,
    showPagination = false,
    isConsideredMobile,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const fetchMixedTokens = async () => {
      // let apiResponse = await fetch(`${API_ENDPOINT}/balances/${account}`).then(resp => resp.json());
      let apiResponse = await AccountBalanceService.getAccountBalancesPaginated(
        account,
        perPage,
        page,
      )
      setIsLoading(false);
      if(apiResponse?.status && apiResponse?.data?.data && isMounted) {
        let renderResults: IBalanceRecord[] = [];
        let assetResults : IAllTokenAssets = {};
        let apiResponseData : IOwnedBalancesResult = apiResponse.data;
        if(apiResponseData?.data?.['ERC-721']) {
          for(let [assetAddress, assetRecord] of Object.entries(apiResponseData?.data?.['ERC-721'])) {
            if(assetRecord?.balances) {
              renderResults = [...renderResults, ...assetRecord.balances];
            }
            if(assetRecord?.asset) {
              assetResults[assetAddress] = assetRecord?.asset;
            }
          }
        }
        if(apiResponseData?.data?.['ERC-20']) {
          for(let [assetAddress, assetRecord] of Object.entries(apiResponseData?.data?.['ERC-20'])) {
            if(assetRecord?.balances) {
              renderResults = [...renderResults, ...assetRecord.balances];
            }
            if(assetRecord?.asset) {
              assetResults[assetAddress] = assetRecord?.asset;
            }
          }
        }
        if(apiResponseData?.metadata?.pagination?.totalPages) {
          setPaginationTotalPages(apiResponseData?.metadata?.pagination?.totalPages);
        }
        setOwnedTokenBalances(renderResults);
        setOwnedTokenAssets(assetResults);
      } else {
        setOwnedTokenBalances([]);
        setOwnedTokenAssets({});
      }
      if(page > 1) {
        setSearchParams((params => {
          params.set("page", page.toString());
          return params;
        }));
      }
    }
    fetchMixedTokens();
    return () => {
      isMounted = false;
    }
  }, [account, perPage, page, setSearchParams])

  return (
    <>
      {showTitle &&
        <div className={[classes.titleContainer, isConsideredMobile ? "flex-column" : ""].join(" ")}>
          <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
            My Assets
          </Typography>
          <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link="my-assets">
            <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
              View my assets
            </Button>
          </LinkWrapper>
        </div>
      }
      <Grid className={classes.sectionSpacer} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
        {!isLoading && ownedTokenBalances && ownedTokenBalances.sort((a, b) => {
          if(a?.asset?.standard && b?.asset?.standard) {
            return (a.asset.standard).localeCompare(b.asset.standard);
          }
          return 0;
        }).slice(0,maxRecords ? maxRecords : ownedTokenBalances.length).map((item, index) => 
          <Grid key={`single-token-card-${index}-${item.asset_address}-${item.token_id ? item.token_id : ''}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard assetRecord={ownedTokenAssets[item?.asset_address]} balanceRecord={item} />
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
          <Pagination page={page} onChange={(event: any, page: number) => setPage(page)} count={paginationTotalPages} variant="outlined" color="primary" />
        </div>
      }
    </>
  )
}

export default AccountTokensBanner;