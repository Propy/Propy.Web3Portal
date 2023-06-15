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

interface IMyTokensBanner {
  maxRecords?: number
}

const MyTokensBanner = (props: IMyTokensBanner) => {

  const [ownedTokens, setOwnedTokens] = useState<IBalanceRecord[]>([]);

  const { account } = useEthers();

  let {
    maxRecords,
  } = props;

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

  return (
    <>
      <Grid container spacing={2} columns={25}>
        {ownedTokens && ownedTokens.sort((a, b) => {
          if(a?.asset?.standard && b?.asset?.standard) {
            return (a.asset.standard).localeCompare(b.asset.standard);
          }
          return 0;
        }).slice(0,maxRecords ? maxRecords : ownedTokens.length).map((item, index) => 
          <Grid key={`single-token-card-${index}`} item xs={12} md={5}>
            <SingleTokenCard tokenRecord={item} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default MyTokensBanner;