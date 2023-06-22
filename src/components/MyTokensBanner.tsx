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
  IBalanceRecord
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

const MyTokensBanner = (props: IMyTokensBanner) => {

  const [ownedTokens, setOwnedTokens] = useState<IBalanceRecord[]>([]);

  const { account } = useEthers();

  const classes = useStyles();

  let {
    maxRecords,
    showTitle = false,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const fetchMyTokens = async () => {
      if(account) {
        let balances = await fetch(`${API_ENDPOINT}/balances/${account}`).then(resp => resp.json());
        if(balances?.status && balances?.data && isMounted) {
          setOwnedTokens(balances?.data);
        }
      } else if(isMounted) {
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
      {showTitle &&
        <div className={classes.titleContainer}>
          <Typography variant="h4" className={[classes.title].join(" ")}>
            My Tokens
          </Typography>
          <LinkWrapper link="my-tokens">
            <Button variant="contained" color="secondary">
              View all tokens
            </Button>
          </LinkWrapper>
        </div>
      }
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