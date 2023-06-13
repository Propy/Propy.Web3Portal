import React, { useEffect, useState } from 'react'

import { useEthers } from '@usedapp/core'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';

import SingleTokenCard from './SingleTokenCard';

import {
  IBalanceRecord
} from '../interfaces';

import {
  API_ENDPOINT,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);

const MyTokensBanner = () => {

  const [ownedTokens, setOwnedTokens] = useState<IBalanceRecord[]>([]);

  const { account } = useEthers();

  useEffect(() => {
    let isMounted = true;
    const fetchMyTokens = async () => {
      if(account) {
        let balances = await fetch(`${API_ENDPOINT}/balances/${account}`).then(resp => resp.json());
        if(balances?.status && balances?.data) {
          setOwnedTokens(balances?.data);
        }
      } else {
        setOwnedTokens([]);
      }
    }
    fetchMyTokens();
    return () => {
      isMounted = false;
    }
  }, [account])

  const classes = useStyles();

  return (
    // <Card
    //     style={{width: '100%', height: '300px', marginTop: '30px'}}
    // />
    <>
      <Grid container spacing={2} columns={25}>
        {ownedTokens && ownedTokens.sort((a, b) => {
          if(a?.asset?.standard && b?.asset?.standard) {
            return (a.asset.standard).localeCompare(b.asset.standard);
          }
          return 0;
        }).slice(0,5).map((item, index) => 
          <Grid key={`single-token-card-${index}`} item xs={12} md={5}>
            <SingleTokenCard tokenRecord={item} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default MyTokensBanner;