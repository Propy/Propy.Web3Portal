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
  IAssetRecord,
  IOwnedBalancesResult,
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

interface IMyTokensBanner {
  maxRecords?: number
  showTitle?: boolean
}

interface IAllTokenAssets {
  [key: string]: IAssetRecord
}

const MyTokensBanner = (props: IMyTokensBanner) => {

  const [ownedTokenBalances, setOwnedTokenBalances] = useState<IBalanceRecord[]>([]);
  const [ownedTokenAssets, setOwnedTokenAssets] = useState<IAllTokenAssets>({});

  const { account } = useEthers();

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const fetchMixedTokens = async () => {
      let apiResponse = await fetch(`${API_ENDPOINT}/balances/${account}`).then(resp => resp.json());
      if(apiResponse?.status && apiResponse?.data && isMounted) {
        let renderResults: IBalanceRecord[] = [];
        let assetResults : IAllTokenAssets = {};
        let apiResponseData : IOwnedBalancesResult = apiResponse.data;
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
        console.log({renderResults, assetResults})
        setOwnedTokenBalances(renderResults);
        setOwnedTokenAssets(assetResults);
      } else {
        setOwnedTokenBalances([]);
        setOwnedTokenAssets({});
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
            My Tokens
          </Typography>
          <LinkWrapper link="my-tokens">
            <Button variant="contained" color="secondary">
              View my tokens
            </Button>
          </LinkWrapper>
        </div>
      }
      <Grid container spacing={2} columns={10}>
        {ownedTokenBalances && ownedTokenBalances.sort((a, b) => {
          if(a?.asset?.standard && b?.asset?.standard) {
            return (a.asset.standard).localeCompare(b.asset.standard);
          }
          return 0;
        }).slice(0,maxRecords ? maxRecords : ownedTokenBalances.length).map((item, index) => 
          <Grid key={`single-token-card-${index}`} item xs={5} md={2}>
            <SingleTokenCard assetRecord={ownedTokenAssets[item?.asset_address]} balanceRecord={item} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default MyTokensBanner;