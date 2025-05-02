import React, { useState, useEffect } from 'react';

import { PieChart } from '@mui/x-charts/PieChart';

import BigNumber from 'bignumber.js';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';

import { useAccount } from 'wagmi';

import { PropsFromRedux } from '../containers/StakeStatsV3ConnectedWalletContainer';

import {
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import { 
  useStakerSharesV3,
} from '../hooks';

import StakeV3LPModuleStakingPosition from './StakeV3LPModuleStakingPosition';
import StakeV3PKModuleStakingPosition from './StakeV3PKModuleStakingPosition';
import StakeV3ERC20ModuleStakingPosition from './StakeV3ERC20ModuleStakingPosition';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeStatsConnectedWallet {
  totalShares: BigInt
  version: number
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
    cardTitle: {
      marginBottom: theme.spacing(2),
    },
    cardSubtitle: {
      marginBottom: theme.spacing(2),
    },
    cardDescription: {
      marginBottom: theme.spacing(2),
      maxWidth: 350
    },
    actionArea: {
      padding: theme.spacing(2),
      textAlign: 'center',
      alignItems: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    },
    moduleIconContainer: {
      height: 100,
      width: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(1),
    },
    tierIcon: {
      maxWidth: '100%',
      maxHeight: '100%',
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
    // version,
  } = props;

  const classes = useStyles();

  const { 
    address,
    chain,
  } = useAccount();

  const [pieChartData, setPieChartData] = useState<false | IPieChartEntry[]>(false);

  const { 
    data: {
      stakerSharesTotal,
    },
    // isLoading: isLoadingStakerShares,
  } = useStakerSharesV3(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  );

  useEffect(() => {
    let newPieChartData = [];

    let totalPercent = 100;
    let individualPercent = 0;
    if(totalShares && (Number(totalShares) > 0)) {
      if(stakerSharesTotal && (Number(stakerSharesTotal) > 0)) {
        individualPercent = ((Number(stakerSharesTotal) * 100) / Number(totalShares));
        totalPercent = totalPercent - individualPercent;
      }
      newPieChartData.push({ id: 0, value: totalPercent, label: address ? 'Other\'s Stake' : 'Network Stake' });
    } else {
      newPieChartData.push({ id: 0, value: 1, label: 'Network Stake' });
    }

    if(address && stakerSharesTotal && (Number(stakerSharesTotal) > 0)) {
      newPieChartData.push({ id: 1, value: individualPercent, label: 'Your Stake' });
    }

    setPieChartData(newPieChartData);

  }, [address, stakerSharesTotal, totalShares])

  return (
    <>
      <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
        <Grid item xs={4} sm={8} md={12} lg={30} xl={10}>
          <StakeV3LPModuleStakingPosition totalShares={totalShares} />
        </Grid>
        <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
          <StakeV3ERC20ModuleStakingPosition totalShares={totalShares} />
        </Grid>
        <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
          <StakeV3PKModuleStakingPosition totalShares={totalShares} />
        </Grid>
      </Grid>
      {/* <Grid container spacing={2}> */}
        {/* <Grid item xs={12} lg={12}>
          <pre>
            {stakerSharesTotal && `stakerSharesTotal: ${priceFormat(Number(utils.formatUnits(JSON.stringify(Number(stakerSharesTotal)), 8)), 2, 'PRO')}`}<br/>
            {stakedPROByStaker && `stakedPROByStaker: ${priceFormat(Number(utils.formatUnits(Number(stakedPROByStaker), 8)), 2, 'PRO')}`}<br/>
            {leaveAmountFromShares && `leaveAmountFromShares: ${priceFormat(Number(utils.formatUnits(Number(leaveAmountFromShares), 8)), 2, 'PRO')}`}<br/>
            {leaveAmountFromShares && stakedPROByStaker && `Available Reward: ${priceFormat(Number(utils.formatUnits(new BigNumber(leaveAmountFromShares.toString()).minus(stakedPROByStaker.toString()).toString(), 8)), 2, 'PRO')}`}
          </pre>
        </Grid> */}
        {/* <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {((isLoadingLeaveAmountFromShares && (version === 1)) || isLoadingStakedPROByStaker || (isLoadingApproxStakerRewardsPending && version === 2)) && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {version === 2 && !isLoadingApproxStakerRewardsPending && !isLoadingStakedPROByStaker && (
                <>
                  <Typography style={{marginBottom: '4px'}} variant="h6">Available Extra PRO</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(new BigNumber(approxStakerRewardsPending ? approxStakerRewardsPending.toString() : 0).toString(), 8)), 2, 'PRO', false, true)}</Typography>
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
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakerSharesTotal ? stakerSharesTotal : 0), 8)), 2, 'pSTAKE', false, true)}</Typography>
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
        </Grid> */}
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
      {/* </Grid> */}
    </>
  );
}

export default StakeStatsConnectedWallet;