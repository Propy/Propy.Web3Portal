import React, { useState, useEffect } from 'react';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import ActionButton from './ActionButton';

import LinkWrapper from './LinkWrapper';

import { useAccount } from 'wagmi';

import {
  priceFormat,
  countdownToTimestamp,
} from '../utils';

import {
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
  STAKING_V3_LP_MODULE_ID,
} from '../utils/constants';

import { 
  useStakerSharesByModuleV3,
  useApproxStakerRewardsPendingByModuleV3,
  useStakerToVirtualStakedPROByModuleV3,
  useStakerModuleUnlockTime,
  useStakerModuleLockedAtTime,
} from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeV3LPModuleStakingPosition {
  onClick?: () => void;
  totalShares?: BigInt;
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
      justifyContent: 'center',
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
    buttonTitleSmallSpacing: {
      marginBottom: theme.spacing(0.5),
    },
    buttonSubtitle: {
      marginTop: theme.spacing(1.5),
      fontWeight: 400,
    },
    buttonSubtitleError: {
      marginTop: theme.spacing(1.5),
      fontWeight: 400,
      color: 'red',
      maxHeight: '100px',
      overflowY: 'scroll',
    },
    buttonTitle: {
      marginBottom: theme.spacing(1),
    },
    stakingButtonContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: theme.spacing(1),
    },
    stakingButtonSpacer: {
      width: '100px',
      marginRight: theme.spacing(2),
    },
    stakingButton: {
      width: '100px',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
);

const StakeV3LPModuleStakingPosition = (props: IStakeV3LPModuleStakingPosition) => {

  let {
    // onClick,
    totalShares,
  } = props;

  const classes = useStyles();
  const [stakeShare, setStakeShare] = useState(0);

  const { 
    address,
    chain,
  } = useAccount();

  const { 
    data: moduleUnlockTime,
    // isLoading: isLoadingModuleUnlockTime,
  } = useStakerModuleUnlockTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_LP_MODULE_ID,
  );

  const { 
    data: moduleLockedAtTime,
    // isLoading: isLoadingModuleUnlockTime,
  } = useStakerModuleLockedAtTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_LP_MODULE_ID,
  );

  const { 
    data: moduleShares,
    isLoading: isLoadingStakerShares,
  } = useStakerSharesByModuleV3(
    STAKING_V3_LP_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  );

  const { 
    data: stakerRewardOnModule,
    // isLoading: isLoadingStakerRewardOnModule,
  } = useApproxStakerRewardsPendingByModuleV3(
    STAKING_V3_LP_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  const { 
    data: virtualStakedPRO,
    // isLoading: isLoadingVirtualStakedPRO,
  } = useStakerToVirtualStakedPROByModuleV3(
    STAKING_V3_LP_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  useEffect(() => {
    if(!isLoadingStakerShares && totalShares) {
      let percent = new BigNumber(moduleShares ? moduleShares.toString() : 0).multipliedBy(100).dividedBy(totalShares ? totalShares.toString() : "0");
      console.log({percent: percent.toNumber()})
      setStakeShare(percent.toNumber());
    }
  }, [totalShares, moduleShares, isLoadingStakerShares]);

  const lockupProgress = ((Math.floor(new Date().getTime() / 1000) - Number(moduleLockedAtTime)) * 100) / (Number(moduleUnlockTime) - Number(moduleLockedAtTime));

  return (
    <>
      <Card 
        style={{
          width: '100%',
          height: '100%',
          opacity: Number(moduleShares) > 0 ? '1' : '1',
        }}
        onClick={() => {
          // setSelectedStakingModule("lp")
        }}
      >
        <div className={classes.actionArea}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Typography variant="h5" className={classes.cardSubtitle}>
              {Number(moduleShares) > 0 ? 'Active' : 'No'} Stake
            </Typography>
          </div>
          <div className={classes.moduleIconContainer}>
            <AssuredWorkloadIcon style={{height: 100, width: 100, color: PROPY_LIGHT_BLUE }} />
          </div>
          <Typography variant="h4" className={classes.cardTitle}>
            Uniswap NFT
          </Typography>
          <div style={{maxWidth: 350, minWidth: '240px', marginLeft: 'auto', marginRight: 'auto'}}>
            {(Number(moduleShares) > 0) && (Number(moduleUnlockTime) * 1000 < new Date().getTime()) &&
              <>
                <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress variant="buffer" value={100} valueBuffer={100} />
                  </Box>
                  <span className='flex-center' style={{marginLeft: '16px'}}>
                    {priceFormat(Number(moduleShares) > 0 ? 100 : 0, 2, "%", false)}
                    <Tooltip placement="top" title={`Once lockup progress reaches 100%, you may claim any allocated rewards, provided you have an active stake!`}>
                      <HelpIcon className={'tooltip-helper-icon'} />
                    </Tooltip>
                  </span>
                </Typography>
                <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                  <span>Lockup Status:</span>
                  <span className='flex-center' style={{marginLeft: '16px'}}>
                    Unlocked
                    <Tooltip placement="top" title={`Since your lockup period is complete, you may unstake to claim any pending rewards once you are ready to do so`}>
                      <HelpIcon className={'tooltip-helper-icon'} />
                    </Tooltip>
                  </span>
                </Typography>
              </>
            }
            {(Number(moduleUnlockTime) * 1000 > new Date().getTime()) &&
              <>
                <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                  <Box sx={{ width: '100%', textAlign: 'left'}}>
                    <LinearProgress variant="buffer" value={lockupProgress} valueBuffer={lockupProgress} />
                  </Box>
                  <span className='flex-center' style={{marginLeft: '16px'}}>
                    {priceFormat(lockupProgress, 3, "%", false)}
                    <Tooltip placement="top" title={`Once lockup progress reaches 100%, you may claim any allocated rewards! Unstaking before your lockup progress is at 100% will forfeit any rewards which you may have been granted via this staking position.`}>
                      <HelpIcon className={'tooltip-helper-icon'} />
                    </Tooltip>
                  </span>
                </Typography>
                <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                  <span>Lockup Remaining:</span>
                  <span className='flex-center' style={{marginLeft: '16px'}}>
                    {countdownToTimestamp(Number(moduleUnlockTime), "")}
                    <Tooltip placement="top" title={`Once this lockup period is over, you will be able to claim any allocated reward!`}>
                      <HelpIcon className={'tooltip-helper-icon'} />
                    </Tooltip>
                  </span>
                </Typography>
              </>
            }
            {/* <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2"><strong>Current Position Details:</strong></Typography> */}
            <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
              <span>Staking Power:</span>
              <span className='flex-center' style={{marginLeft: '16px'}}>
                {priceFormat(Number(utils.formatUnits(Number(moduleShares ? moduleShares : 0), 8)), 2, 'pSTAKE', false, true)} 
                <Tooltip placement="top" title={`pSTAKE value can be used to derive your percentage share of how much of an incoming reward will be allocated to your wallet (pending lockup completion).`}>
                  <HelpIcon className={'tooltip-helper-icon'} />
                </Tooltip>
              </span>
            </Typography>
            <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
              <span>Reward Share:</span>
              <span className='flex-center' style={{marginLeft: '16px'}}>
                {priceFormat(stakeShare, 2, '%', false, true)} 
                <Tooltip placement="top" title={`This value is derived from your staking power (pSTAKE) and represents the share of incoming rewards which will be allocated to your staking position`}>
                  <HelpIcon className={'tooltip-helper-icon'} />
                </Tooltip>
              </span>
            </Typography>
            {Number(moduleShares) > 0 &&
              <>
                {(Number(moduleUnlockTime) * 1000 > new Date().getTime()) &&
                  <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                    <span>Allocated Reward:</span>
                    <span className='flex-center' style={{marginLeft: '16px'}}>
                      {priceFormat(Number(utils.formatUnits(Number(stakerRewardOnModule ? stakerRewardOnModule : 0), 8)), 2, 'PRO', false, true)} 
                      <Tooltip placement="top" title={`An "allocated reward" refers to a PRO reward which will only become claimable once the position's lockup timer reaches maturity, so this value effectively shows how much PRO can be claimed against this staking position once the position's lockup timer ends.`}>
                        <HelpIcon className={'tooltip-helper-icon'} />
                      </Tooltip>
                    </span>
                  </Typography>
                }
                {(Number(moduleUnlockTime) * 1000 < new Date().getTime()) &&
                  <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                    <span>Pending Reward:</span>
                    <span className='flex-center' style={{marginLeft: '16px'}}>
                      {priceFormat(Number(utils.formatUnits(Number(stakerRewardOnModule ? stakerRewardOnModule : 0), 8)), 2, 'PRO', false, true)} 
                      <Tooltip placement="top" title={`Your position has reached maturity, therefore you may use your pSTAKE in order to claim your reward`}>
                        <HelpIcon className={'tooltip-helper-icon'} />
                      </Tooltip>
                    </span>
                  </Typography>
                }
                <Typography className={[classes.buttonTitle, 'flex-center', 'space-between'].join(" ")} variant="subtitle2">
                  <span>Position Value:</span>
                  <span className='flex-center' style={{marginLeft: '16px'}}>
                  {priceFormat(Number(utils.formatUnits(Number(virtualStakedPRO ? virtualStakedPRO : 0), 8)), 2, 'PRO', false, true)}
                  <Tooltip placement="top" title={`Represents an estimate of the PRO value of the combined assets in the liquidity position pair (PRO + ETH) staked within this module`}>
                    <HelpIcon className={'tooltip-helper-icon'} />
                  </Tooltip>
                  </span>
                </Typography>
              </>
            }
          </div>
          <div className={classes.stakingButtonContainer}>
            <LinkWrapper
              link={"/staking/v3/stake/lp"}
            >
              <ActionButton
                className={[classes.stakingButton, classes.stakingButtonSpacer].join(" ")}
                buttonColor="secondary"
                text={"Stake"}
              />
            </LinkWrapper>
            {Number(moduleShares) > 0 &&
              <LinkWrapper
                link={"/staking/v3/unstake/lp"}
              >
                <ActionButton
                  className={classes.stakingButton}
                  buttonColor="secondary"
                  text={"Unstake"}
                />
              </LinkWrapper>
            }
          </div>
        </div>
      </Card>
    </>
  );
}

export default StakeV3LPModuleStakingPosition;