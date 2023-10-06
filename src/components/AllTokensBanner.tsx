import React, { useEffect, useState } from 'react'

import { useEthers } from '@usedapp/core'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import SingleTokenCard from './SingleTokenCard';
import LinkWrapper from './LinkWrapper';

import {
  IBalanceRecord,
  IMixedBalancesResult,
  IAssetRecord,
} from '../interfaces';

import {
  API_ENDPOINT,
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
    }
  }),
);

interface IAllTokensBanner {
  maxRecords?: number
  showTitle?: boolean
}

interface IAllTokenAssets {
  [key: string]: IAssetRecord
}

const AllTokensBanner = (props: IAllTokensBanner) => {

  const [allTokenBalances, setAllTokenBalances] = useState<IBalanceRecord[]>([]);
  const [allTokenAssets, setAllTokenAssets] = useState<IAllTokenAssets>({});

  const { account } = useEthers();

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const fetchMixedTokens = async () => {
      let apiResponse = await fetch(`${API_ENDPOINT}/balances/mix`).then(resp => resp.json());
      if(apiResponse?.status && apiResponse?.data && isMounted) {
        let renderResults: IBalanceRecord[] = [];
        let assetResults : IAllTokenAssets = {};
        let apiResponseData : IMixedBalancesResult = apiResponse.data;
        if(apiResponseData?.['ERC-721']) {
          for(let [assetAddress, assetRecord] of Object.entries(apiResponseData?.['ERC-721'])) {
            if(assetRecord?.balances) {
              renderResults = [...renderResults, ...assetRecord.balances];
            }
            if(assetRecord?.asset) {
              assetResults[assetAddress] = assetRecord?.asset;
            }
          }
        }
        console.log({renderResults})
        setAllTokenBalances(renderResults);
        setAllTokenAssets(assetResults);
      } else {
        setAllTokenBalances([]);
        setAllTokenAssets({});
      }
    }
    fetchMixedTokens();
    return () => {
      isMounted = false;
    }
  }, [account])

  return (
    <>
      {showTitle &&
        <div className={classes.titleContainer}>
          <Typography variant="h4" className={[classes.title].join(" ")}>
            Propy Assets
          </Typography>
          <LinkWrapper link="my-assets">
            <Button variant="contained" color="secondary">
              View all assets
            </Button>
          </LinkWrapper>
        </div>
      }
      <Grid container spacing={2} columns={25}>
        {allTokenBalances && allTokenBalances.sort((a, b) => {
          if(allTokenAssets[a?.asset_address]?.standard && allTokenAssets[b?.asset_address]?.standard) {
            return (allTokenAssets[a?.asset_address]?.standard).localeCompare(allTokenAssets[b?.asset_address]?.standard);
          }
          return 0;
        }).slice(0,maxRecords ? maxRecords : allTokenBalances.length).map((item, index) => 
          <Grid key={`single-token-card-${index}`} item xs={12} md={5}>
            <SingleTokenCard balanceRecord={item} assetRecord={allTokenAssets[item?.asset_address]} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default AllTokensBanner;