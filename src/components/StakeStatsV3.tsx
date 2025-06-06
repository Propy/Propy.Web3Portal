import React, { useState } from 'react';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useAccount } from 'wagmi';

import { PropsFromRedux } from '../containers/StakeStatsV3Container';

import {
  priceFormat,
} from '../utils';

import {
  STAKING_V3_PRO_ADDRESS,
  STAKING_V3_PROPYKEYS_ADDRESS,
  STAKING_V3_PROPYOG_ADDRESS,
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import StakeStatsV3ConnectedWalletContainer from '../containers/StakeStatsV3ConnectedWalletContainer';

import CountdownTimer from './CountdownTimer';
import StakeSeasonsTimelineV3 from './StakeSeasonsTimelineV3';
import StakingEventsV3 from './StakingEventsV3';

import { 
  useTotalStakingShareSupply,
  useTotalStakedPRO,
  useStakedTokenCount,
  useTotalStakingBalancePRO,
  useOpenSeasonEndTimeV3,
  useTotalVirtualStakedPRO,
} from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeStats {
  version: number;
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

  let {
    version,
    isConsideredMobile,
  } = props;

  const [expandMobileView, setExpandMobileView] = useState(false);

  let currentSeason = 1;

  const classes = useStyles();

  const { 
    address,
  } = useAccount();

  const { chain } = useAccount();

  const { 
    data: stakerShares,
    isLoading: isLoadingStakerShares,
  } = useTotalStakingShareSupply(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  );

  const { 
    data: totalStakedPRO,
    isLoading: isLoadingTotalStakedPRO,
  } = useTotalStakedPRO(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: totalVirtualStakedPRO,
    isLoading: isLoadingTotalVirtualStakedPRO,
  } = useTotalVirtualStakedPRO(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: openSeasonEndTime,
    // isLoading: isLoadingOpenSeasonEndTime,
  } = useOpenSeasonEndTimeV3(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: totalStakingBalancePRO,
    isLoading: isLoadingTotalStakingBalancePRO,
  } = useTotalStakingBalancePRO(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    STAKING_V3_PRO_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: stakedPropyKeysCount,
    isLoading: isLoadingStakedPropyKeysCount,
  } = useStakedTokenCount(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    STAKING_V3_PROPYKEYS_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: stakedOGCount,
    isLoading: isLoadingStakedOGCount,
  } = useStakedTokenCount(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    STAKING_V3_PROPYOG_ADDRESS,
    chain ? chain.id : undefined
  );
  
  return (
    <div className={classes.root}>
      <div style={{width: '100%'}}>
      {/* {address &&
        <Grid container spacing={2}>
          <StakeStatsConnectedWalletContainer totalShares={stakerShares} />
        </Grid>
      } */}
      {openSeasonEndTime &&
        <div className={classes.personalStatsSpacer}>
          <Grid container spacing={2} columns={{ xs: 12, md: 12, lg: 12, xl: 12 }}>
            {/* <Grid item xs={12} md={12} lg={12}>
                <div style={{width: '100%', marginTop: '16px'}}>
                  <StakeSeasonsTimelineV3 activeSeason={currentSeason} />
                </div>
            </Grid> */}
            <Grid item xs={12} md={12} lg={12}>
              <Card className={classes.card} style={{paddingTop: '24px', paddingBottom: '0px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                {(Number(openSeasonEndTime) > Math.floor(new Date().getTime() / 1000)) 
                  ?
                    <>
                      <Typography variant='h4' style={{marginBottom: '16px', fontSize: isConsideredMobile ? '1.5rem' : 'auto', textAlign: 'center'}}>
                        🎉 Staking Season {currentSeason} Entry Open 🎉
                      </Typography>
                      <Typography variant='h6' style={{textAlign: 'center'}}>
                        Closing In:
                      </Typography>
                      <Typography variant='h6' style={{marginBottom: '16px', fontWeight: '400', textAlign: 'center'}}>
                        <CountdownTimer endTime={Number(openSeasonEndTime)} showFullTimer={true} />
                      </Typography>
                      <Typography variant='subtitle2' style={{textAlign: 'center', fontWeight: '400'}}>
                        <strong>Please Note:</strong><br/>
                        Once the entry period closes, it will not be possible to enter the staking protocol until the next season begins. Each season lasts ~ 4 months.
                      </Typography>
                    </>
                  :
                    <>
                      <Typography variant='h4' style={{marginBottom: '16px', fontSize: isConsideredMobile ? '1.5rem' : 'auto', textAlign: 'center'}}>
                        🔒 Staking Season {currentSeason} Entry Closed 🔒
                      </Typography>
                      <Typography variant='subtitle2' style={{textAlign: 'center', fontWeight: '400'}}>
                        <strong>Please Note:</strong><br/>
                        Staking entry will open for 7 days once the next season starts
                      </Typography>
                    </>
                }
                <Typography variant='subtitle2' style={{textAlign: 'center', fontWeight: '400', marginTop: '24px'}}>
                  <strong>Season Schedule (NOT FINAL):</strong>
                </Typography>
                <div style={{width: '100%', marginTop: '16px'}}>
                  <StakeSeasonsTimelineV3 activeSeason={currentSeason} />
                </div>
              </Card>
            </Grid>
          </Grid>
        </div>
      }
      {address &&
        <div className={classes.personalStatsSpacer}>
          <StakeStatsV3ConnectedWalletContainer version={version} totalShares={stakerShares} />
        </div>
      }
      <Grid container spacing={2} columns={{ xs: 12, md: 12, lg: 12, xl: 12 }} style={{justifyContent: 'center'}}>
        <Grid item xs={12} md={6} lg={3}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {isLoadingStakerShares && (
                <>
                  <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px', textAlign: 'center'}} />
                  <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                </>
              )}
              {!isLoadingStakerShares && (
                <>
                  <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Total Staking Power</Typography>
                  <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(stakerShares ? stakerShares : 0), 8)), 2, 'pSTAKE', false, true)}</Typography>
                </>
              )}
            </div>
          </Card>
        </Grid>
        {(isConsideredMobile && !expandMobileView) &&
          <Grid item xs={12} md={12} lg={12}>
            <Typography style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px', fontWeight: 'bold', cursor: 'pointer', color: PROPY_LIGHT_BLUE}} onClick={() => setExpandMobileView(true)}>
              <KeyboardArrowDownIcon/>&nbsp;&nbsp;Show More Stats&nbsp;&nbsp;<KeyboardArrowDownIcon/>
            </Typography>
          </Grid>
        }
        {(!isConsideredMobile || (isConsideredMobile && expandMobileView)) &&
          <>
            <Grid item xs={12} md={6} lg={3}>
              <Card className={classes.card}>
                <div className={classes.cardInner}>
                  {isLoadingTotalStakedPRO && (
                    <>
                      <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                      <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                    </>
                  )}
                  {!isLoadingTotalStakedPRO && (
                    <>
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Total Staked PRO</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(totalStakedPRO ? totalStakedPRO : 0), 8)), 2, 'PRO', false, true)}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card className={classes.card}>
                <div className={classes.cardInner}>
                  {isLoadingTotalVirtualStakedPRO && (
                    <>
                      <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                      <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                    </>
                  )}
                  {!isLoadingTotalVirtualStakedPRO && (
                    <>
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Total Virtual Staked PRO</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(totalVirtualStakedPRO ? totalVirtualStakedPRO : 0), 8)), 2, 'PRO', false, true)}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Total PRO Balance</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number(totalStakingBalancePRO ? totalStakingBalancePRO : 0), 8)), 2, 'PRO', false, true)}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card className={classes.card}>
                <div className={classes.cardInner}>
                  {(isLoadingTotalStakingBalancePRO || isLoadingTotalStakedPRO) && (
                    <>
                      <CircularProgress color="inherit" style={{height: '24px', width: '24px', marginBottom: '16px'}} />
                      <Typography style={{fontWeight: 400}} variant="subtitle1">Loading...</Typography>
                    </>
                  )}
                  {(!isLoadingTotalStakingBalancePRO && !isLoadingTotalStakedPRO) && (
                    <>
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Total Unclaimed Rewards</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(utils.formatUnits(Number((totalStakingBalancePRO && totalStakedPRO) ? new BigNumber(totalStakingBalancePRO.toString()).minus(new BigNumber(totalStakedPRO.toString())).toString() : 0), 8)), 2, 'PRO', false, true)}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Staked PropyKeys</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(stakedPropyKeysCount ? stakedPropyKeysCount : 0), 0, 'pKEYs')}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
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
                      <Typography style={{marginBottom: '4px', textAlign: 'center'}} variant="h6">Staked PropyOG</Typography>
                      <Typography style={{fontWeight: 400}} variant="h6">{priceFormat(Number(stakedOGCount ? stakedOGCount : 0), 0, 'pOGs')}</Typography>
                    </>
                  )}
                </div>
              </Card>
            </Grid> 
          </>
        }
        <Grid item xs={12} lg={12}>
          <StakingEventsV3 />
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