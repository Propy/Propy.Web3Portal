import React from 'react';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAccount, useNetwork } from 'wagmi';

import { PropsFromRedux } from '../containers/StakeStatsContainer';

import {
  priceFormat,
} from '../utils';

import {
  BASE_PROPYKEYS_STAKING_CONTRACT,
  PRO_BASE_L2_ADDRESS,
  BASE_PROPYKEYS_STAKING_NFT,
  BASE_OG_STAKING_NFT,
} from '../utils/constants';

import StakeStatsConnectedWalletContainer from '../containers/StakeStatsConnectedWalletContainer';

import { useTotalStakingShareSupply, useTotalStakedPRO, useStakedTokenCount, useTotalStakingBalancePRO } from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeStats {

}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
    },
    card: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    cardInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(4),
      width: '100%',
    },
    personalStatsSpacer: {
      marginBottom: theme.spacing(2),
    }
  }),
);

const StakeStats = (props: PropsFromRedux & IStakeStats) => {

  // let {

  // } = props;

  const classes = useStyles();

  const { 
    address,
  } = useAccount();

  const { chain } = useNetwork();

  const { 
    data: stakerShares,
    isLoading: isLoadingStakerShares,
  } = useTotalStakingShareSupply(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    chain ? chain.id : undefined
  );

  const { 
    data: totalStakedPRO,
    isLoading: isLoadingTotalStakedPRO,
  } = useTotalStakedPRO(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    chain ? chain.id : undefined
  )

  const { 
    data: totalStakingBalancePRO,
    isLoading: isLoadingTotalStakingBalancePRO,
  } = useTotalStakingBalancePRO(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    PRO_BASE_L2_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: stakedPropyKeysCount,
    isLoading: isLoadingStakedPropyKeysCount,
  } = useStakedTokenCount(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    BASE_PROPYKEYS_STAKING_NFT,
    chain ? chain.id : undefined
  )

  const { 
    data: stakedOGCount,
    isLoading: isLoadingStakedOGCount,
  } = useStakedTokenCount(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    BASE_OG_STAKING_NFT,
    chain ? chain.id : undefined
  )

  console.log({isLoadingStakerShares})
  
  return (
    <div className={classes.root}>
      <div style={{width: '100%'}}>
      {/* {address &&
        <Grid container spacing={2}>
          <StakeStatsConnectedWalletContainer totalShares={stakerShares} />
        </Grid>
      } */}
      {address &&
        <div className={classes.personalStatsSpacer}>
          <StakeStatsConnectedWalletContainer totalShares={stakerShares} />
        </div>
      }
      <Grid container spacing={2} columns={{ xs: 12, md: 12, lg: 10, xl: 10 }}>
        <Grid item xs={12} md={6} lg={2}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakerShares && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakerShares && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Total Staking Power</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakerShares ? stakerShares : 0), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingTotalStakedPRO && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakerShares && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Total Staked PRO</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(totalStakedPRO ? totalStakedPRO : 0), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingTotalStakingBalancePRO && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingTotalStakingBalancePRO && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Total PRO Balance</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(totalStakingBalancePRO ? totalStakingBalancePRO : 0), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakedPropyKeysCount && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakedPropyKeysCount && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Staked PropyKeys</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(stakedPropyKeysCount ? stakedPropyKeysCount : 0), 0, 'pKEYs')}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={2}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakedOGCount && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakedOGCount && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Staked PropyOG</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakedOGCount ? stakedOGCount : 0), 8)), 0, 'pOGs')}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        {/* <Grid item xs={12} lg={12}>
          <pre>
            {`stakerShares: ${stakerShares}`}<br/>
            {`totalStakingBalancePRO: ${totalStakingBalancePRO}`}<br/>
            {`totalStakedPRO: ${totalStakedPRO}`}<br/>
            {`stakedPropyKeysCount: ${stakedPropyKeysCount}`}<br/>
            {`stakedOGCount: ${stakedOGCount}`}<br/>
            {stakerShares && `totalShares: ${priceFormat(Number(utils.formatUnits(Number(stakerShares), 8)), 2, 'PRO')}`}<br/>
            {totalStakingBalancePRO && `totalStakingBalancePRO: ${priceFormat(Number(utils.formatUnits(Number(totalStakingBalancePRO), 8)), 2, 'PRO')}`}<br/>
            {totalStakedPRO && `totalStakedPRO: ${priceFormat(Number(utils.formatUnits(Number(totalStakedPRO), 8)), 2, 'PRO')}`}<br/>
            {stakedPropyKeysCount && `stakedPropyKeysCount: ${priceFormat(Number(utils.formatUnits(Number(stakedPropyKeysCount), 8)), 0, 'pKEYs')}`}<br/>
            {stakedOGCount && `stakedOGCount: ${priceFormat(Number(utils.formatUnits(Number(stakedOGCount), 8)), 0, 'pOGs')}`}<br/>
            {totalStakingBalancePRO && totalStakedPRO && `Reward: ${priceFormat(Number(utils.formatUnits(new BigNumber(totalStakingBalancePRO.toString()).minus(totalStakedPRO.toString()).toString(), 8)), 2, 'PRO')}`}
          </pre>
        </Grid> */}
      </Grid>
      </div>
    </div>
  );
}

export default StakeStats;