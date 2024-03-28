import React, { useEffect, useState } from 'react'

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

import { PropsFromRedux } from '../containers/AccountTokensBannerContainer';

import {
  IBalanceRecord,
  IAssetRecord,
  IOwnedBalancesResult,
} from '../interfaces';

import {
  AccountBalanceService,
  OnchainProxyService,
} from '../services/api';

import {
  ETH_L1_NETWORK,
  BASE_L2_NETWORK,
  PRO_BASE_L2_ADDRESS,
  PRO_ETHEREUM_L1_ADDRESS,
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
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    paginationTotalContainer: {
      marginTop: theme.spacing(1),
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
  // const [paginationTotalRecords, setPaginationTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
    account,
    showPagination = false,
    isConsideredMobile,
  } = props;

  const { 
    data: l2ProBalanceData,
    isLoading: isLoadingL2ProBalanceData,
  } = useQuery({
    queryKey: ['l2PROBalance', account],
    queryFn: async () => {
      let l2PROBalanceResponse = await OnchainProxyService.getBalanceERC20(
        BASE_L2_NETWORK,
        PRO_BASE_L2_ADDRESS,
        account,
      );
      if (l2PROBalanceResponse?.status && l2PROBalanceResponse?.data) {
        let {
          balance,
          token_info,
        } = l2PROBalanceResponse?.data;
        token_info.decimals = token_info.decimal ? token_info.decimal : token_info.decimals;
        token_info.symbol = `${token_info.symbol} (Base)`
        return {
          balance: balance[token_info.address],
          tokenInfo: token_info,
        }
      }
      return null;
    },
    cacheTime: 60, // Cache the data indefinitely
    staleTime: 60, // Data is always considered fresh
  });

  const { 
    data: l1ProBalanceData,
    isLoading: isLoadingL1ProBalanceData,
  } = useQuery({
    queryKey: ['l1PROBalance', account],
    queryFn: async () => {
      let l2PROBalanceResponse = await OnchainProxyService.getBalanceERC20(
        ETH_L1_NETWORK,
        PRO_ETHEREUM_L1_ADDRESS,
        account,
      );
      if (l2PROBalanceResponse?.status && l2PROBalanceResponse?.data) {
        let {
          balance,
          token_info,
        } = l2PROBalanceResponse?.data;
        token_info.decimals = token_info.decimal ? token_info.decimal : token_info.decimals;
        token_info.symbol = `${token_info.symbol} (Ethereum)`
        return {
          balance: balance[token_info.address],
          tokenInfo: token_info,
        }
      }
      return null;
    },
    cacheTime: 60, // Cache the data indefinitely
    staleTime: 60, // Data is always considered fresh
  });

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
        // commenting this out while we transition to current balances from chain
        // if(apiResponseData?.data?.['ERC-20']) {
        //   for(let [assetAddress, assetRecord] of Object.entries(apiResponseData?.data?.['ERC-20'])) {
        //     if(assetRecord?.balances) {
        //       renderResults = [...renderResults, ...assetRecord.balances];
        //     }
        //     if(assetRecord?.asset) {
        //       assetResults[assetAddress] = assetRecord?.asset;
        //     }
        //   }
        // }
        if(apiResponseData?.metadata?.pagination?.totalPages) {
          setPaginationTotalPages(apiResponseData?.metadata?.pagination?.totalPages);
        } else {
          setPaginationTotalPages(0);
        }
        // if(apiResponseData?.metadata?.pagination?.total) {
        //   setPaginationTotalRecords(apiResponseData?.metadata?.pagination?.total);
        // } else {
        //   setPaginationTotalRecords(0);
        // }
        setOwnedTokenBalances(renderResults);
        setOwnedTokenAssets(assetResults);
      } else {
        setOwnedTokenBalances([]);
        setOwnedTokenAssets({});
        setPaginationTotalPages(0);
        // setPaginationTotalRecords(0);
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
    fetchMixedTokens();
    return () => {
      isMounted = false;
    }
  }, [account, perPage, page, setSearchParams, searchParams])

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
        {!isLoadingL1ProBalanceData && l1ProBalanceData?.balance &&
          <Grid key={`single-token-card-l1-pro-${l1ProBalanceData.tokenInfo.address}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard assetRecord={l1ProBalanceData.tokenInfo} 
              balanceRecord={{
                balance: l1ProBalanceData.balance,
                network_name: ETH_L1_NETWORK,
                asset_address: l1ProBalanceData.tokenInfo.address,
                //@ts-ignore
                asset: {
                  decimals: l1ProBalanceData.tokenInfo.decimals,
                  standard: 'ERC-20',
                }
              }}
            />
          </Grid>
        }
        {!isLoadingL2ProBalanceData && l2ProBalanceData?.balance &&
          <Grid key={`single-token-card-l1-pro-${l2ProBalanceData.tokenInfo.address}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard assetRecord={l2ProBalanceData.tokenInfo} 
              balanceRecord={{
                balance: l2ProBalanceData.balance,
                network_name: ETH_L1_NETWORK,
                asset_address: l2ProBalanceData.tokenInfo.address,
                //@ts-ignore
                asset: {
                  decimals: l2ProBalanceData.tokenInfo.decimals,
                  standard: 'ERC-20',
                }
              }}
            />
          </Grid>
        }
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
        <>
          <div className={classes.paginationContainer}>
            <Pagination page={page} onChange={(event: any, page: number) => setPage(page)} count={paginationTotalPages} variant="outlined" color="primary" />
          </div>
          {/* {
            paginationTotalRecords &&
            <Typography variant="subtitle1" className={classes.paginationTotalContainer}>
              {paginationTotalRecords} total records
            </Typography>
          } */}
        </>
      }
    </>
  )
}

export default AccountTokensBanner;