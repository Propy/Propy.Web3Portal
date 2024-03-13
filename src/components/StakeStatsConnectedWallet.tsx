import React, { useState, useEffect } from 'react';

import { PieChart } from '@mui/x-charts/PieChart';

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

import { PropsFromRedux } from '../containers/StakeStatsConnectedWalletContainer';

import {
  priceFormat,
  countdownToTimestamp,
} from '../utils';

import {
  BASE_PROPYKEYS_STAKING_CONTRACT,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import { 
  useStakerShares,
  useApproxLeaveAmountFromShareAmount,
  useStakedPROByStaker,
  useStakerUnlockTime,
} from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeStatsConnectedWallet {
  totalShares: BigInt
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
  }),
);

interface IPieChartEntry {
  id: number
  value: number
  label: string
}

const StakeStatsConnectedWallet = (props: PropsFromRedux & IStakeStatsConnectedWallet) => {

  let {
    totalShares,
    isConsideredMobile,
  } = props;

  const classes = useStyles();

  const { 
    address,
  } = useAccount();

  const { chain } = useNetwork();

  const [pieChartData, setPieChartData] = useState<false | IPieChartEntry[]>(false);

  const { 
    data: stakerShares,
    isLoading: isLoadingStakerShares,
  } = useStakerShares(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    address,
    chain ? chain.id : undefined
  );

  const { 
    data: stakerUnlockTime,
    isLoading: isLoadingStakerUnlockTime,
  } = useStakerUnlockTime(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    address,
    chain ? chain.id : undefined
  );

  const { 
    data: leaveAmountFromShares,
    isLoading: isLoadingLeaveAmountFromShares,
  } = useApproxLeaveAmountFromShareAmount(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    stakerShares,
    chain ? chain.id : undefined
  )

  const { 
    data: stakedPROByStaker,
    isLoading: isLoadingStakedPROByStaker,
  } = useStakedPROByStaker(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    address,
    chain ? chain.id : undefined
  )

  useEffect(() => {
    let newPieChartData = [];

    let totalPercent = 100;
    let individualPercent = 0;
    if(totalShares && (Number(totalShares) > 0)) {
      if(stakerShares && (Number(stakerShares) > 0)) {
        individualPercent = ((Number(stakerShares) * 100) / Number(totalShares));
        totalPercent = totalPercent - individualPercent;
      }
      newPieChartData.push({ id: 0, value: totalPercent, label: address ? 'Other\'s Stake' : 'Network Stake' });
    } else {
      newPieChartData.push({ id: 0, value: 1, label: 'Network Stake' });
    }

    if(address && stakerShares && (Number(stakerShares) > 0)) {
      newPieChartData.push({ id: 1, value: individualPercent, label: 'Your Stake' });
    }

    setPieChartData(newPieChartData);

  }, [address, stakerShares, totalShares])

  return (
    <>
      <Grid container spacing={2}>
        {/* <Grid item xs={12} lg={12}>
          <pre>
            {stakerShares && `stakerShares: ${priceFormat(Number(utils.formatUnits(JSON.stringify(Number(stakerShares)), 8)), 2, 'PRO')}`}<br/>
            {stakedPROByStaker && `stakedPROByStaker: ${priceFormat(Number(utils.formatUnits(Number(stakedPROByStaker), 8)), 2, 'PRO')}`}<br/>
            {leaveAmountFromShares && `leaveAmountFromShares: ${priceFormat(Number(utils.formatUnits(Number(leaveAmountFromShares), 8)), 2, 'PRO')}`}<br/>
            {leaveAmountFromShares && stakedPROByStaker && `Available Reward: ${priceFormat(Number(utils.formatUnits(new BigNumber(leaveAmountFromShares.toString()).minus(stakedPROByStaker.toString()).toString(), 8)), 2, 'PRO')}`}
          </pre>
        </Grid> */}
        <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {(isLoadingLeaveAmountFromShares || isLoadingStakedPROByStaker) && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingLeaveAmountFromShares && !isLoadingStakedPROByStaker && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Available Extra PRO</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(new BigNumber(leaveAmountFromShares ? leaveAmountFromShares.toString() : 0).minus(stakedPROByStaker ? stakedPROByStaker.toString() : 0).toString(), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakedPROByStaker && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakedPROByStaker && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Your Staked PRO</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakedPROByStaker ? stakedPROByStaker : 0), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
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
                  <Typography style={{marginBottom: '4px'}} variant="h6">Your Staking Power</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakerShares ? stakerShares : 0), 8)), 2, 'pSTAKE', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakerUnlockTime && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakerUnlockTime && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Lockup Status</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{`${countdownToTimestamp(Number(stakerUnlockTime ? stakerUnlockTime : 0), "Unlocked")}`}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingLeaveAmountFromShares && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingLeaveAmountFromShares && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Withdrawable PRO</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(leaveAmountFromShares), 8)), 2, 'PRO', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid> */}
        <Grid item xs={12} lg={12}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {pieChartData && 
                <PieChart
                colors={["#80c8ff", PROPY_LIGHT_BLUE]}
                  series={[
                    {
                      data: pieChartData,
                      innerRadius: 50,
                      valueFormatter: (entry) => `${entry.value.toFixed(2)} %`
                    },
                  ]}
                  width={isConsideredMobile ? 400 : 700}
                  height={isConsideredMobile ? 200 : 400}
                />
              }
            </div>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default StakeStatsConnectedWallet;