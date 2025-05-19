import React, { useState, useEffect, useId, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query'

import { useNavigate } from 'react-router-dom';

import { animated, useSpring } from '@react-spring/web';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import BackIcon from '@mui/icons-material/KeyboardBackspace';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { useAccount, useBalance, useReadContract, useBlockNumber } from 'wagmi';

import SingleTokenCard from './SingleTokenCard';
import SingleTokenCardLoading from './SingleTokenCardLoading';

import FloatingActionButton from './FloatingActionButton';

import {
  priceFormat,
  countdownToTimestamp,
  sleep,
} from '../utils';

import {
  STAKING_V3_CONTRACT_ADDRESS,
  STAKING_V3_PRO_MODULE_ADDRESS,
  STAKING_V3_PRO_ADDRESS,
  STAKING_V3_ALT_PRO_ADDRESS,
  STAKING_V3_NETWORK,
  STAKING_V3_ALT_NETWORK,
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
  STAKING_V3_ERC20_MODULE_ID,
  NETWORK_NAME_TO_ID,
} from '../utils/constants';

import {
  IBalanceRecord,
} from '../interfaces';

import ERC20ABI from '../abi/ERC20ABI.json';
import StakingV3CombinedErrorsABI from '../abi/StakingV3CombinedErrorsABI';
import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';

import {
  StakeService,
} from '../services/api';

import { 
  useStakerModuleUnlockTime,
  // useStakerModuleLockedAtTime,
  useUnifiedWriteContract,
  useApproxStakerRewardsPendingByModuleV3,
  useOpenSeasonEndTimeV3,
  useIsLockupBoostedV3,
  useCountdownSeconds,
} from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
  version: number
  selectedStakingModule: false | "pro" | "lp" | "propykeys"
  setSelectedStakingModule: (module: false | "pro" | "lp" | "propykeys") => void
}

const lockupDaysToBonus = {
  3: 0,
  60: 10,
  90: 20,
  180: 40,
  365: 100,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      lineHeight: 0,
      flexDirection: 'row'
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
    },
    floatingActionZone: {
      position: 'fixed',
      maxWidth: '450px',
      width: 'calc(100% - 16px)',
      transform: 'translateY(0%)',
      textAlign: 'center',
      zIndex: 1200,
    },
    floatingActionZoneCard: {
      padding: theme.spacing(2),
      maxHeight: '90vh',
      overflowY: 'auto',
      // border: `2px solid ${PROPY_LIGHT_BLUE}`,
    },
    submitButtonContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    topSpacer: {
      marginTop: theme.spacing(2),
    },
    proStakeAmountFieldContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    submitButton: {
      width: '100%',
    },
    stepContainer: {
      width: '100%',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    selectionOptionsContainer: {
      width: '100%',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    selectionOptionsSpacer: {
      maxWidth: '350px',
      display: 'flex',
      justifyContent: 'space-evenly',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    buttonSubtitle: {
      marginTop: theme.spacing(1.5),
      fontWeight: 400,
    },
    buttonSubtitleBottomSpacer: {
      marginBottom: theme.spacing(1.5),
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
    buttonTitleSmallSpacing: {
      marginBottom: theme.spacing(0.5),
    },
    loadingZone: {
      opacity: 0.5,
    },
    loadMoreButtonContainer: {
      marginTop: theme.spacing(4),
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    actionArea: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
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

const getApprovePROButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingPROAllowanceTx: boolean,
  proStakeAmount: string,
) => {
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingPROAllowanceTx) {
    return "Granting Allowance...";
  }

  if(proStakeAmount === "" || Number(proStakeAmount) <= 0) {
    return "Enter PRO Stake Amount"
  }

  return "Grant PRO Allowance";
}

const getUnstakeButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingUnstakeTx: boolean,
  isSyncingStaking: boolean,
) => {

  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingUnstakeTx) {
    return "Unstaking...";
  }

  if(isSyncingStaking) {
    return "Syncing...";
  }
  
  return "Unstake";
}

const getEarlyUnstakeButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingUnstakeTx: boolean,
  isSyncingStaking: boolean,
) => {

  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingUnstakeTx) {
    return "Unstaking...";
  }

  if(isSyncingStaking) {
    return "Syncing...";
  }
  
  return "Early Unstake";
}

const getStakeButtonTextPRO = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingStakeTx: boolean,
  isSyncingStaking: boolean,
  selectedLockupPeriodDays: number,
  openSeasonEndTime: number,
  stakerRewardOnModule: number,
  isLockupBoosted: boolean,
) => {
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingStakeTx) {
    return "Staking...";
  }

  if(isSyncingStaking) {
    return "Syncing...";
  }

  if(!selectedLockupPeriodDays) {
    return "Select Lockup Period"
  }

  if(openSeasonEndTime < Math.floor(new Date().getTime() / 1000)) {
    return "Staking Entry Closed"
  }

  if(stakerRewardOnModule > 0) {
    return "Pending Unclaimed Rewards"
  }

  if(isLockupBoosted) {
    return "Boosted Lockup Detected"
  }
  
  return "Stake";
}

const getActiveStep = (
  mode: string,
  selectedTokenAddress: string | false,
  currentStakingContractAllowance: string,
  proStakeAmount: string,
  selectedLockupPeriodDays: 0|3|60|90|180|365,
) => {
  if(mode === "enter") {
    let isSufficientAllowancePRO = (Number(proStakeAmount) > 0) && new BigNumber(currentStakingContractAllowance).isGreaterThanOrEqualTo(new BigNumber(utils.parseUnits(proStakeAmount, 8).toString()));
    if (selectedTokenAddress === STAKING_V3_PRO_ADDRESS) {
      if ((Number(currentStakingContractAllowance) === 0) || !isSufficientAllowancePRO) {
        return 0;
      }
      else if (isSufficientAllowancePRO) {
        if(!selectedLockupPeriodDays) {
          return 1;
        }
        return 2;
      }
    }
  } else if (mode === "leave") {
    return 0;
  }
  return 0;
}

interface IRealTimeCountdownZone {
  mode: 'countdowns' | 'tips',
  classes: any
  selectedLockupPeriodDays: 0|3|60|90|180|365
  stakerRewardOnModule: any
  isLockupBoosted: boolean
  stakerUnlockTimePRO: number
  openSeasonEndTime: number
}

const RealTimeCountdownZone = (props: IRealTimeCountdownZone) => {

  const {
    mode,
    classes,
    selectedLockupPeriodDays,
    stakerRewardOnModule,
    isLockupBoosted,
    stakerUnlockTimePRO,
    openSeasonEndTime,
  } = props;

  const { 
    secondsRemaining: secondsRemainingUnlockTime,
    formattedCountdown: formattedCountdownUnlockTime,
  } = useCountdownSeconds(stakerUnlockTimePRO);

  const {
    secondsRemaining: secondsRemainingOpenSeason,
    formattedCountdown: formattedCountdownRemainingOpenSeason, 
  } = useCountdownSeconds(openSeasonEndTime);

  return (
    <>
      {mode === 'tips' &&
        <>
          {(secondsRemainingOpenSeason > 0)
            ?
              <>
                {(Number(stakerRewardOnModule ? stakerRewardOnModule : 0) > 0) 
                  ?
                    <>
                      <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Unclaimed rewards detected:</strong><br/>You <strong>may not</strong> increase your stake using a wallet address with unclaimed rewards on this staking module. {secondsRemainingUnlockTime > 0 ? `Since you are in an active lockup period, it is recommended to use an ` : `Since your lockup period has ended, you can either unstake to claim your unclaimed rewards (at which point you can restake with a new amount of PRO) or use an `} <strong>alternative wallet address</strong> to stake additional PRO.</Typography>
                    </>
                  :
                    <>
                      {isLockupBoosted && 
                        <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Boosted position detected:</strong><br/>You <strong>may not</strong> increase your stake using a wallet address with an actively boosted position. Please use an <strong>alternative wallet address</strong> to stake additional PRO.</Typography>
                      }
                    </>
                }
                {((selectedLockupPeriodDays > 0 && Number(stakerRewardOnModule ? stakerRewardOnModule : 0) === 0) && !isLockupBoosted) && <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Lockup periods can't be modified once created.</strong> Staking now would create a <strong>{selectedLockupPeriodDays}-day lockup</strong> period on all staked PRO tokens, including PRO that is already staked on this staking module. You can remove your staked PRO at any time, but <strong>if you unstake during your lockup period, you will forfeit all rewards associated with your stake.</strong>.</Typography>}
              </>
            : 
              <>
                <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Entry not open:</strong><br/>The entry period for staking has ended, the next staking entry period will begin at the start of the next season.</Typography>
              </>
          }
        </>
      }
      {mode === 'countdowns' &&
        <>
          {(secondsRemainingUnlockTime > 0) &&
            <Typography style={{marginTop: '8px'}} className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
              Active Lockup Remaining: {formattedCountdownUnlockTime} 
              <Tooltip placement="top" title={`Time remaining on your currently-active lockup on this PRO staking module.`}>
                <HelpIcon className={'tooltip-helper-icon'} />
              </Tooltip>
            </Typography>
          }
          {(secondsRemainingOpenSeason > 0) &&
            <Typography style={{marginTop: (secondsRemainingUnlockTime <= 0) ? '8px' : '0px'}} className={['flex-center'].join(" ")} variant="subtitle2">
              Entry Time Remaining: {formattedCountdownRemainingOpenSeason} 
              <Tooltip placement="top" title={`This is how much time is left to create a staking position in the latest season`}>
                <HelpIcon className={'tooltip-helper-icon'} />
              </Tooltip>
            </Typography>
          }
        </>
      }
    </>
  )
}

const StakePortalV3 = (props: IStakeEnter) => {

  const {
    mode,
    postStakeSuccess,
    version,
    selectedStakingModule,
  } = props;

  const navigate = useNavigate();

  const [lastErrorMessage, setLastErrorMessage] = useState<false | string>(false);

  const uniqueId = useId();

  const classes = useStyles();

  let isDeprecatedStakingVersion = false;

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { chain } = useAccount();

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<false | string>(false);
  const [activeStep, setActiveStep] = useState<0|1|2>(0);
  const [selectedLockupPeriodDays, setSelectedLockupPeriodDays] = useState<0|3|60|90|180|365>(0);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);
  // const [showRequireTenModal, setShowRequireTenModal] = useState(false);
  const [isSyncingStaking, setIsSyncingStaking] = useState(false);
  const [proStakeAmount, setProStakeAmount] = useState("0");
  const [acceptsEarlyUnstake, setAcceptEarlyUnstake] = useState(false);

  const { 
    address,
  } = useAccount();

  const actionZoneFungibleSpring = useSpring({
    from: {
      bottom: '0px',
      transform: 'translateY(100%)',
    },
    to: {
      bottom: (selectedTokenAddress && !isSyncingStaking) ? '100px' : '0px',
      transform: `translateY(${(selectedTokenAddress && !isSyncingStaking) ? '0%' : '100%'})`,
    },
  })

  const actionZoneSyncingSpring = useSpring({
    from: {
      bottom: '0px',
      transform: 'translateY(100%)',
    },
    to: {
      bottom: isSyncingStaking ? '100px' : '0px',
      transform: `translateY(${isSyncingStaking ? '0%' : '100%'})`,
    },
  })

  useEffect(() => {
    setSelectedTokenIds([]);
    setSelectedTokenAddress(false);
  }, [address])

  useEffect(() => {
    setSelectedTokenIds([]);
    setSelectedTokenAddress(false);
  }, [version])

  useEffect(() => {
    setSelectedTokenIds([]);
    setSelectedTokenAddress(false);
  }, [triggerUpdateIndex])

  const handleFungibleRecordSelectedSingle = (balanceRecord: IBalanceRecord) => {
    console.log({balanceRecord});
    if(balanceRecord?.asset_address !== selectedTokenAddress) {
      setSelectedTokenAddress(balanceRecord.asset_address);
    } else {
      setSelectedTokenAddress(false);
    }
    setLastErrorMessage(false);
  }

  const handleModalClose = () => {
    setSelectedTokenAddress(false);
    setLastErrorMessage(false);
  }

  const { 
    data: stakingContractPROAllowance,
    queryKey: stakingContractPROAllowanceQueryKey,
  } = useReadContract({
    address: STAKING_V3_PRO_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address, STAKING_V3_PRO_MODULE_ADDRESS],
  });

  const { 
    data: stakerToPureStakedPRO,
    queryKey: stakerToPureStakedPROQueryKey,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToPureStakedPRO',
    args: [address],
  });

  const { 
    data: stakerToPureStakedPROShares,
    queryKey: stakerToPureStakedPROSharesQueryKey,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToPureStakedPROShares',
    args: [address],
  });

  const { 
    data: stakerUnlockTimePRO,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerModuleUnlockTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_ERC20_MODULE_ID,
  );

  // const { 
  //   data: moduleLockedAtTime,
  //   // isLoading: isLoadingModuleUnlockTime,
  // } = useStakerModuleLockedAtTime(
  //   STAKING_V3_CORE_CONTRACT_ADDRESS,
  //   address,
  //   chain ? chain.id : undefined,
  //   STAKING_V3_ERC20_MODULE_ID,
  // );

  const {
    data: balanceDataPRO,
    queryKey: balanceDataPROQueryKey,
    isLoading,
  } = useBalance({
    address: address,
    token: STAKING_V3_PRO_ADDRESS,
    chainId: NETWORK_NAME_TO_ID[STAKING_V3_NETWORK] ? NETWORK_NAME_TO_ID[STAKING_V3_NETWORK] : undefined,
  });

  const {
    data: balanceDataAltPRO,
    queryKey: balanceDataAltPROQueryKey
  } = useBalance({
    address: address,
    token: STAKING_V3_ALT_PRO_ADDRESS,
    chainId: NETWORK_NAME_TO_ID[STAKING_V3_ALT_NETWORK] ? NETWORK_NAME_TO_ID[STAKING_V3_ALT_NETWORK] : undefined,
  });

  const {
    data: balancePStake,
    queryKey: balancePStakeQueryKey,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { 
    data: stakerRewardOnModule,
    // isLoading: isLoadingStakerRewardOnModule,
  } = useApproxStakerRewardsPendingByModuleV3(
    STAKING_V3_ERC20_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  const {
    data: isLockupBoosted,
    // isLoading: isLockupBoostedLoading,
  } = useIsLockupBoostedV3(
    STAKING_V3_ERC20_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  const { 
    data: openSeasonEndTime,
    // isLoading: isLoadingOpenSeasonEndTime,
  } = useOpenSeasonEndTimeV3(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  )

  useEffect(() => {

    const queryKeys = [
      balanceDataPROQueryKey,
      balanceDataAltPROQueryKey,
      stakerToPureStakedPROQueryKey,
      stakingContractPROAllowanceQueryKey,
      stakerToPureStakedPROSharesQueryKey,
      balancePStakeQueryKey,
    ];

    if (queryKeys.every(Boolean)) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [
    blockNumber,
    queryClient,
    balanceDataPROQueryKey,
    balanceDataAltPROQueryKey,
    stakingContractPROAllowanceQueryKey,
    stakerToPureStakedPROQueryKey,
    stakerToPureStakedPROSharesQueryKey,
    balancePStakeQueryKey,
  ]);

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    executeTransaction: executePerformPROAllowanceTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformPROAllowanceTx,
    isAwaitingTx: isAwaitingPerformPROAllowanceTx,
    // isLoading: isLoadingPerformPStakeAllowanceTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_PRO_ADDRESS,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [STAKING_V3_PRO_MODULE_ADDRESS, utils.parseUnits(Number(proStakeAmount) > 0 ? proStakeAmount : "0", 8)],
    }, 
    successToastMessage: `Granted PRO Allowance!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE PRO ON CHAIN CALLS ABOVE

  // --------------------------------------

  // STAKE CALLS BELOW
  const { 
    executeTransaction: executePerformStakePROTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformStakePROTx,
    isAwaitingTx: isAwaitingPerformStakePROTx,
    // isLoading: isLoadingPerformStakePROTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'enterWithOnlyERC20',
      args: [utils.parseUnits(Number(proStakeAmount) > 0 ? proStakeAmount : "0", 8), selectedLockupPeriodDays],
    },
    successToastMessage: `Stake success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false);
      }
      syncStaking();
    },
    onError: (error: any) => {
      console.log({error})
      let errorMessage : string | false = false;
      if (error === 'NotOpenSeason') {
        errorMessage = `Entry has closed for the current staking season, please wait for the entry period at the beginning of the next season to enter.`
      } else if (error === 'StakerNotApproved') {
        errorMessage = `Your wallet address has not been approved to enter the staking protocol, please ensure you have completed the KYC process.`
      } else if (error === 'UnstakeAllBeforeAddingMore') {
        errorMessage = `You have pending rewards, please unstake all staked tokens to claim all pending rewards before staking more tokens.`
      } else {
        errorMessage = error?.details ? error.details : `Unable to complete transaction, please try again or contact support (error: ${error}).`
      }
      toast.error(errorMessage);
      setLastErrorMessage(errorMessage);
    }
  });

  // STAKE CALLS ABOVE

  // --------------------------------------

  // UNSTAKING ON CHAIN CALLS BELOW

  const { 
    executeTransaction: executePerformUnstakePROTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformUnstakePROTx,
    isAwaitingTx: isAwaitingPerformUnstakePROTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'leaveWithOnlyERC20',
      args: [],
    },
    successToastMessage: `Unstake PRO success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false)
      }
      syncStaking();
    },
  });

  const { 
    executeTransaction: executePerformEarlyUnstakePROTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformEarlyUnstakePROTx,
    isAwaitingTx: isAwaitingPerformEarlyUnstakePROTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'earlyLeaveWithOnlyERC20',
      args: [],
    },
    successToastMessage: `Early unstake PRO success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PRO');
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false)
      }
      syncStaking();
    },
  });

  // UNSTAKING ON CHAIN CALLS ABOVE

  // --------------------------------------

  useEffect(() => {
    setSelectedLockupPeriodDays(0);
    setAcceptEarlyUnstake(false);
  }, [proStakeAmount, selectedTokenIds, selectedTokenAddress])
  
  useEffect(() => {
    let latestActiveStep : 0|1|2 = getActiveStep(
      mode,
      selectedTokenAddress,
      `${stakingContractPROAllowance}`,
      `${proStakeAmount}`,
      selectedLockupPeriodDays,
    );
    setActiveStep(latestActiveStep);
  }, [mode, selectedTokenAddress, stakingContractPROAllowance, proStakeAmount, selectedLockupPeriodDays])

  const isAwaitingWalletInteraction = useMemo(() => {
    return (
      isAwaitingWalletInteractionPerformPROAllowanceTx ||
      // isAwaitingWalletInteractionPerformUnstakeLPTx ||
      isAwaitingWalletInteractionPerformStakePROTx ||
      isAwaitingWalletInteractionPerformUnstakePROTx ||
      isAwaitingWalletInteractionPerformEarlyUnstakePROTx
    );
  }, [
    isAwaitingWalletInteractionPerformPROAllowanceTx,
    isAwaitingWalletInteractionPerformStakePROTx,
    isAwaitingWalletInteractionPerformUnstakePROTx,
    isAwaitingWalletInteractionPerformEarlyUnstakePROTx,
  ]);

  const disableSelectionAdjustments = useMemo(() => {
    return (
      isAwaitingWalletInteraction || 
      isAwaitingPerformPROAllowanceTx || 
      isAwaitingPerformStakePROTx ||
      isAwaitingPerformUnstakePROTx ||
      isAwaitingPerformEarlyUnstakePROTx ||
      isSyncingStaking
    )
  }, [
    isAwaitingWalletInteraction, 
    isAwaitingPerformPROAllowanceTx,
    isAwaitingPerformStakePROTx,
    isAwaitingPerformUnstakePROTx,
    isAwaitingPerformEarlyUnstakePROTx,
    isSyncingStaking
  ])

  const getHelperTextPRO = () => {
    if(mode === "enter") {
      if(selectedTokenAddress === STAKING_V3_PRO_ADDRESS) {
        return (
          <>
            There is no limit to how much PRO you can stake in a single transaction, you have <strong>{priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value?.toString() : 0), 8)), 2, 'PRO', false, true)}</strong>.
          </>
        )
      } else {
        return (
          <>
            <strong>This PRO balance exists on Ethereum (L1), in order to stake this PRO, you need to first bridge your PRO to Base (L2) via a Base-recommended bridge such as <a href="https://superbridge.app/base" target="_blank" rel="noopener noreferrer">Superbridge</a></strong>.
          </>
        )
      }
    } else {
      return (
        <>
          
        </>
      )
    }
  }

  return (
    <>
      {selectedStakingModule &&
        <div style={{cursor: 'pointer', color: PROPY_LIGHT_BLUE, textAlign: 'left', marginBottom: 16, display: 'flex', alignItems: 'center'}} onClick={() => {setSelectedTokenIds([]);setSelectedTokenAddress(false);navigate(`/staking/v3/${mode === "enter" ? "stake" : "unstake"}`)}}>
          <BackIcon style={{marginRight: '8px'}} />
          <Typography variant="body1" style={{fontWeight: 'bold'}}>
            Back to staking options
          </Typography>
        </div>
      }
      <div className={classes.root}>
        {selectedStakingModule === "pro" &&
          <>
            {((!isDeprecatedStakingVersion) || (mode === "leave")) &&
              <>
                <Grid className={(isLoading) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {!(isLoading) &&
                    <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                      <Typography variant="body1" style={{textAlign: 'left'}}>
                        Please click on the token(s) that you would like to {mode === "enter" ? "stake" : "unstake"}
                      </Typography>
                    </Grid>
                  }
                  {!(isLoading) &&
                    <>
                      <Grid item xs={4} sm={4} md={6} lg={5} xl={6}>
                        <SingleTokenCard 
                          selected={(selectedTokenAddress === STAKING_V3_PRO_ADDRESS)}
                          onBalanceRecordSelected={handleFungibleRecordSelectedSingle}
                          selectable={true}
                          balanceRecord={{
                            ...(mode === "enter" && { balance: balanceDataPRO ? balanceDataPRO?.value?.toString() : "0"}),
                            ...(mode === "leave" && { balance: stakerToPureStakedPRO ? stakerToPureStakedPRO.toString() : "0" }),
                            network_name: STAKING_V3_NETWORK,
                            asset_address: STAKING_V3_PRO_ADDRESS,
                            //@ts-ignore
                            asset: {
                              decimals: '8',
                              standard: 'ERC-20',
                            }
                          }}
                          //@ts-ignore
                          assetRecord={{
                            address: STAKING_V3_PRO_ADDRESS,
                            symbol: "TESTPRO",
                            name: "TestPropy",
                            decimals: "8",
                            standard: "ERC-20",
                            network_name: STAKING_V3_NETWORK,
                          }}
                        />
                      </Grid>
                      {mode === "enter" && (Number(balanceDataAltPRO) > 0) &&
                        <Grid item xs={4} sm={4} md={6} lg={5} xl={6}>
                          <SingleTokenCard
                            selected={(selectedTokenAddress === STAKING_V3_ALT_PRO_ADDRESS)}
                            onBalanceRecordSelected={handleFungibleRecordSelectedSingle}
                            selectable={true}
                            balanceRecord={{
                              balance: balanceDataAltPRO ? balanceDataAltPRO?.value?.toString() : "0",
                              network_name: STAKING_V3_ALT_NETWORK,
                              asset_address: STAKING_V3_ALT_PRO_ADDRESS,
                              //@ts-ignore
                              asset: {
                                decimals: '8',
                                standard: 'ERC-20',
                              }
                            }}
                            //@ts-ignore
                            assetRecord={{
                              address: STAKING_V3_ALT_PRO_ADDRESS,
                              symbol: "TESTPRO",
                              name: "TestPropy",
                              decimals: "8",
                              standard: "ERC-20",
                              network_name: STAKING_V3_ALT_NETWORK,
                            }}
                          />
                        </Grid>
                      }
                    </>
                  }
                  {(isLoading) && 
                    <>
                      <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                        <Typography variant="body1" style={{textAlign: 'left'}}>
                          Loading...
                        </Typography>
                      </Grid>
                      {
                        Array.from({length: 2}).map((entry, index) => 
                          <Grid key={`${uniqueId}-pro-single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                            <SingleTokenCardLoading />
                          </Grid>
                        )
                      }
                    </>
                  }
                </Grid>
                <animated.div className={classes.floatingActionZone} style={actionZoneFungibleSpring}>
                  <Card className={classes.floatingActionZoneCard} elevation={6}>
                      <div 
                        style={{
                          position: 'absolute',
                          right: '5px',
                          top: '5px',
                        }}
                      >
                        <CloseIcon 
                          style={{
                            cursor: (disableSelectionAdjustments) ? 'progress' : 'pointer',
                            width: 25,
                            height: 25,
                            margin: 8,
                            opacity: (disableSelectionAdjustments) ? '0.1' : '1',
                          }}
                          onClick={() => {
                            if(disableSelectionAdjustments) {
                              return;
                            }
                            handleModalClose();
                          }}
                        />
                      </div>
                      <Typography variant="h6">
                        {mode === "enter" ? "Stake " : "Unstake "} PRO
                      </Typography>
                      {selectedTokenAddress !== STAKING_V3_PRO_ADDRESS &&
                        <Typography variant="caption" style={{lineHeight: 1.6}}>
                          {getHelperTextPRO()}
                        </Typography>
                      }
                      {mode === "enter" &&
                        <>
                          {selectedTokenAddress === STAKING_V3_PRO_ADDRESS &&
                            <Box className={classes.stepContainer}>
                              <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                                {/* TODO feed getActiveStep the proper allowance required param */}
                                <Stepper activeStep={activeStep} alternativeLabel>
                                  <Step key={`${uniqueId}-Approve PRO`}>
                                    <StepLabel>{"Approve PRO"}</StepLabel>
                                  </Step>
                                  <Step key={`${uniqueId}-Select PRO Lockup`}>
                                    <StepLabel>{"Select Lockup"}</StepLabel>
                                  </Step>
                                  <Step key={`${uniqueId}-Enter Staking`}>
                                    <StepLabel>{"Enter Staking"}</StepLabel>
                                  </Step>
                                </Stepper>
                              </div>
                            </Box>
                          }
                          {selectedTokenAddress === STAKING_V3_PRO_ADDRESS && ([0,1,2].indexOf(activeStep) > -1) &&
                            <>
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  Current Allowance: {priceFormat(Number(utils.formatUnits(Number(stakingContractPROAllowance ? stakingContractPROAllowance : 0), 8)), 2, 'PRO', false, true)} 
                                  {/* <Tooltip placement="top" title={`Unstaking would burn ${priceFormat(Number(utils.formatUnits(Number(sharesIssuedAgainstSelectionLP ? sharesIssuedAgainstSelectionLP : 0), 8)), 2, 'pSTAKE', false, true)} from your total pSTAKE balance (${priceFormat(Number(utils.formatUnits(Number(balancePStake ? balancePStake : 0), 8)), 2, 'pSTAKE', false, true)}) to withdraw your original LP token along with any pending rewards.`}>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip> */}
                                </Typography>
                              </div>
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                <TextField
                                  id="pro-stake-amount"
                                  label="PRO Stake Amount"
                                  sx={{ width: 'calc(100%)' }}
                                  value={Number(proStakeAmount) ? proStakeAmount : ""}
                                  onChange={(event) => setProStakeAmount(event.target.value)}
                                  type="number"
                                />
                                <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginTop: '4px'}}>
                                  <Typography className={[classes.buttonTitle, 'flex-end'].join(" ")} variant="subtitle2">
                                    <span 
                                      style={{marginRight: '8px'}}>Balance:</span>
                                      <strong 
                                        style={{color: PROPY_LIGHT_BLUE, cursor: 'pointer'}}
                                        onClick={() => {
                                          if(balanceDataPRO?.value) {
                                            setProStakeAmount(priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value?.toString() : 0), 8)), 2, ""))
                                          }
                                        }}
                                      >
                                        {priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value?.toString() : 0), 8)), 2, 'PRO', false, true)}
                                      </strong>
                                  </Typography>
                                </div>
                              </div>
                            </>
                          }
                          {(selectedTokenAddress === STAKING_V3_PRO_ADDRESS) && (activeStep === 1 || activeStep === 2) &&
                            <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginTop: '4px'}}>
                                {/* <Typography className={[classes.buttonTitle, 'flex-start'].join(" ")} variant="subtitle2">
                                  <span style={{marginRight: '8px'}}>Lockup Period (days):</span>
                                </Typography> */}
                                <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  Lockup Period (days)
                                  <Tooltip placement="top" title={
                                    <span>
                                      Lockup periods grant bonus pSTAKE, which leads to <strong>increased reward allocations per unit of staked PRO</strong>.<br/>
                                      3 days: {lockupDaysToBonus[3]}% bonus<br/>
                                      60 days: {lockupDaysToBonus[60]}% bonus 🔥<br/>
                                      90 days: {lockupDaysToBonus[90]}% bonus 🔥🔥<br/>
                                      180 days: {lockupDaysToBonus[180]}% bonus 🔥🔥🔥🔥<br/>
                                      365 days: {lockupDaysToBonus[365]}% bonus 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
                                    </span>
                                  }>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip>
                                </Typography>
                              </div>
                              <ButtonGroup style={{width: '100%'}}>
                                <Button variant={(selectedLockupPeriodDays === 3) ? "contained" : "outlined"} onClick={() => setSelectedLockupPeriodDays(3)} style={{width: '100%', color: (selectedLockupPeriodDays === 3) ? 'white' : ''}}>3</Button>
                                <Button variant={(selectedLockupPeriodDays === 60) ? "contained" : "outlined"} onClick={() => setSelectedLockupPeriodDays(60)} style={{width: '100%', color: (selectedLockupPeriodDays === 60) ? 'white' : ''}}>60</Button>
                                <Button variant={(selectedLockupPeriodDays === 90) ? "contained" : "outlined"} onClick={() => setSelectedLockupPeriodDays(90)} style={{width: '100%', color: (selectedLockupPeriodDays === 90) ? 'white' : ''}}>90</Button>
                                <Button variant={(selectedLockupPeriodDays === 180) ? "contained" : "outlined"} onClick={() => setSelectedLockupPeriodDays(180)} style={{width: '100%', color: (selectedLockupPeriodDays === 180) ? 'white' : ''}}>180</Button>
                                <Button variant={(selectedLockupPeriodDays === 365) ? "contained" : "outlined"} onClick={() => setSelectedLockupPeriodDays(365)} style={{width: '100%', color: (selectedLockupPeriodDays === 365) ? 'white' : ''}}>365</Button>
                              </ButtonGroup>
                              {(selectedLockupPeriodDays !== 0) &&
                                <>
                                  <Typography style={{marginTop: '16px'}} className={['flex-center'].join(" ")} variant="subtitle2">
                                    Lockup Bonus: {lockupDaysToBonus[selectedLockupPeriodDays]}%
                                    <Tooltip placement="top" title={`You will receive ${lockupDaysToBonus[selectedLockupPeriodDays]}% more pSTAKE tokens for each unit of PRO staked (reward allocations effectively increased by ${lockupDaysToBonus[selectedLockupPeriodDays]}%)`}>
                                      <HelpIcon className={'tooltip-helper-icon'} />
                                    </Tooltip>
                                  </Typography>
                                  {(lockupDaysToBonus?.[selectedLockupPeriodDays] > 0) &&
                                    <Typography className={['flex-center'].join(" ")} variant="subtitle2">
                                      {
                                        Array.from({length: lockupDaysToBonus[selectedLockupPeriodDays] / 10}).map(() => {
                                          return <>🔥</>
                                        })
                                      }
                                    </Typography>
                                  }
                                </>
                              }
                              <Typography style={{marginTop: (selectedLockupPeriodDays !== 0) ? '8px' : '16px'}} className={['flex-center'].join(" ")} variant="subtitle2">
                                pSTAKE estimate: {priceFormat((new BigNumber(proStakeAmount).multipliedBy(1 + (lockupDaysToBonus[selectedLockupPeriodDays ? selectedLockupPeriodDays : 3] / 100)).multipliedBy(100)).toString(), 2, "pSTAKE")}
                                <Tooltip placement="top" title={`This pSTAKE estimate represents how much staking power you would receive from creating this staking position${selectedLockupPeriodDays > 3 ? `, your selected lockup period would cause you to receive ${lockupDaysToBonus[selectedLockupPeriodDays ? selectedLockupPeriodDays : 3]}% more pSTAKE tokens for each unit of PRO staked (reward allocations effectively increased by ${lockupDaysToBonus[selectedLockupPeriodDays ? selectedLockupPeriodDays : 3]}%), this results in a bonus of ~ ${priceFormat((new BigNumber(proStakeAmount).multipliedBy(1 + (lockupDaysToBonus[selectedLockupPeriodDays ? selectedLockupPeriodDays : 3] / 100)).multipliedBy(100).minus(new BigNumber(proStakeAmount).multipliedBy(100))).toString(), 2, "pSTAKE")}` : '.'}`}>
                                  <HelpIcon className={'tooltip-helper-icon'} />
                                </Tooltip>
                              </Typography>
                              <RealTimeCountdownZone
                                mode="countdowns"
                                classes={classes}
                                selectedLockupPeriodDays={selectedLockupPeriodDays}
                                stakerRewardOnModule={stakerRewardOnModule}
                                isLockupBoosted={isLockupBoosted}
                                stakerUnlockTimePRO={stakerUnlockTimePRO}
                                openSeasonEndTime={openSeasonEndTime}
                              />
                            </div>
                          }
                          <div className={classes.submitButtonContainer}>
                            {
                              (
                                selectedTokenAddress === STAKING_V3_PRO_ADDRESS
                                && activeStep === 0
                              ) &&
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={isAwaitingWalletInteraction || isAwaitingPerformPROAllowanceTx || isNaN(Number(stakingContractPROAllowance)) || proStakeAmount === "" || Number(proStakeAmount) <= 0}
                                onClick={() => executePerformPROAllowanceTx()}
                                showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformPROAllowanceTx}
                                text={getApprovePROButtonText(isAwaitingWalletInteraction, isAwaitingPerformPROAllowanceTx, proStakeAmount)}
                              />
                            }
                            {
                              (
                                selectedTokenAddress !== STAKING_V3_PRO_ADDRESS
                                && activeStep === 0
                              ) &&
                              <a className={classes.submitButton} href="https://superbridge.app/base" target="_blank" rel="noopener noreferrer">
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  onClick={() => {}}
                                  text={"Bridge PRO"}
                                />
                              </a>
                            }
                            {/* {
                              (
                                ((selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS) || (selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS))
                                && activeStep === 1
                              ) &&
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={isLoadingMinimumRequiredPROAllowance || isAwaitingWalletInteraction || isAwaitingPerformPROAllowanceTx || !minimumRequiredPROAllowance || isNaN(Number(stakingContractPROAllowance))}
                                onClick={() => executePerformPROAllowanceTx()}
                                showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformPROAllowanceTx}
                                text={getApprovePROButtonText(isAwaitingWalletInteraction, isAwaitingPerformPROAllowanceTx)}
                              />
                            } */}
                            {
                              (
                                ((selectedTokenAddress === STAKING_V3_PRO_ADDRESS))
                                && activeStep === 2
                              ) &&
                              <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                                <RealTimeCountdownZone
                                  mode="tips"
                                  classes={classes}
                                  selectedLockupPeriodDays={selectedLockupPeriodDays}
                                  stakerRewardOnModule={stakerRewardOnModule}
                                  isLockupBoosted={isLockupBoosted}
                                  stakerUnlockTimePRO={stakerUnlockTimePRO}
                                  openSeasonEndTime={openSeasonEndTime}
                                />
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingWalletInteraction || isAwaitingPerformStakePROTx || isSyncingStaking || !selectedLockupPeriodDays || (Number(openSeasonEndTime) < Math.floor(new Date().getTime() / 1000)) || (Number(stakerRewardOnModule) > 0) || isLockupBoosted}
                                  onClick={() => {executePerformStakePROTx();setLastErrorMessage(false)}}
                                  showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformStakePROTx || isSyncingStaking}
                                  text={getStakeButtonTextPRO(isAwaitingWalletInteraction, isAwaitingPerformStakePROTx, isSyncingStaking, selectedLockupPeriodDays, Number(openSeasonEndTime ? openSeasonEndTime : 0), Number(stakerRewardOnModule ? stakerRewardOnModule : 0), isLockupBoosted)}
                                />
                              </div>
                            }
                          </div>
                        </>
                      }
                      {mode === "leave" &&
                        <>
                          <div className={classes.submitButtonContainer}>
                            {/* {
                              (
                                activeStep === 0
                              ) &&
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingPerformPStakeAllowanceTx || isAwaitingWalletInteraction}
                                  onClick={() => executePerformPStakeAllowanceTx()}
                                  showLoadingIcon={isAwaitingPerformPStakeAllowanceTx || isAwaitingWalletInteraction}
                                  text={getApprovePStakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformPStakeAllowanceTx)}
                                />
                                
                                <div style={{marginTop: '20px', textWrap: 'nowrap'}}>
                                  {`sharesIssuedAgainstSelectionLP: ${sharesIssuedAgainstSelectionLP}`}
                                </div>
                              </div>
                            } */}
                            {
                              (
                                activeStep === 0
                              ) &&
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2">Unstaking Details:</Typography>
                                <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  pSTAKE Burn: {priceFormat(Number(utils.formatUnits(Number(stakerToPureStakedPROShares ? stakerToPureStakedPROShares : 0), 8)), 2, 'pSTAKE', false, true)} 
                                  <Tooltip placement="top" title={`Unstaking would burn ${priceFormat(Number(utils.formatUnits(Number(stakerToPureStakedPROShares ? stakerToPureStakedPROShares : 0), 8)), 2, 'pSTAKE', false, true)} from your total pSTAKE balance (${priceFormat(Number(utils.formatUnits(Number(balancePStake ? balancePStake : 0), 8)), 2, 'pSTAKE', false, true)}) to withdraw your original LP token along with any pending rewards.`}>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip>
                                </Typography>
                                <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  Original PRO Staked: {priceFormat(Number(utils.formatUnits(Number(stakerToPureStakedPRO ? stakerToPureStakedPRO : 0), 8)), 2, 'PRO', false, true)} 
                                  <Tooltip placement="top" title={`This is the amount of PRO associated with your stake (before accounting for rewards).`}>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip>
                                </Typography>
                                {/* <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  {`cumulativeRewardsPerShare: ${cumulativeRewardsPerShare}`}
                                  {`stakerToModuleIdToCumulativeRewardsPerShareLP: ${stakerToModuleIdToCumulativeRewardsPerShareLP}`}
                                  {`sharesIssuedAgainstSelectionLP: ${sharesIssuedAgainstSelectionLP}`}
                                </Typography> */}
                                <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                  Estimated Reward: {priceFormat(Number(utils.formatUnits(stakerRewardOnModule ? stakerRewardOnModule.toString() : 0, 8)), 2, 'PRO', false, true)} 
                                  {/* <Tooltip placement="top" title={`Unstaking t.`}>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip> */}
                                </Typography>
                                {(Number(stakerUnlockTimePRO) * 1000 < new Date().getTime()) &&
                                  <FloatingActionButton
                                    className={classes.submitButton}
                                    buttonColor="secondary"
                                    disabled={isAwaitingPerformUnstakePROTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimePRO) * 1000 > new Date().getTime()) || isSyncingStaking}
                                    onClick={() => executePerformUnstakePROTx()}
                                    showLoadingIcon={isAwaitingPerformUnstakePROTx || isAwaitingWalletInteraction || isSyncingStaking}
                                    text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformUnstakePROTx, isSyncingStaking)}
                                  />
                                }
                                {(Number(stakerUnlockTimePRO) * 1000 > new Date().getTime()) &&
                                  <>
                                    <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Locked for {countdownToTimestamp(Number(stakerUnlockTimePRO), "")}</strong></Typography>
                                    <FormGroup>
                                      <FormControlLabel
                                        componentsProps={{ typography: { variant: 'caption' } }}
                                        required 
                                        control={
                                          <Checkbox
                                            checked={acceptsEarlyUnstake}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                              setAcceptEarlyUnstake(event.target.checked);
                                            }}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                          />
                                        } 
                                        label={<>I accept that unstaking now would <strong>forfeit any rewards</strong> associated with my stake on this module <strong>({priceFormat(Number(utils.formatUnits(stakerRewardOnModule ? stakerRewardOnModule.toString() : 0, 8)), 2, 'PRO', false, true)})</strong> due to being in an active lockup period</>}
                                      />
                                    </FormGroup>
                                    <FloatingActionButton
                                      className={[classes.submitButton, classes.topSpacer, classes.cardTitle].join(" ")}
                                      buttonColor="error"
                                      disabled={isAwaitingPerformEarlyUnstakePROTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimePRO) * 1000 < new Date().getTime()) || isSyncingStaking || !acceptsEarlyUnstake}
                                      onClick={() => executePerformEarlyUnstakePROTx()}
                                      showLoadingIcon={isAwaitingPerformUnstakePROTx || isAwaitingWalletInteraction || isSyncingStaking}
                                      text={getEarlyUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformEarlyUnstakePROTx, isSyncingStaking)}
                                    />
                                  </>
                                }
                              </div>
                            }
                          </div>
                        </>
                      }
                      {lastErrorMessage &&
                        <Typography className={classes.buttonSubtitleError} variant="subtitle2">{lastErrorMessage}</Typography>
                      }
                  </Card>
                </animated.div>
                <animated.div className={classes.floatingActionZone} style={actionZoneSyncingSpring}>
                  <Card className={classes.floatingActionZoneCard} elevation={6}>
                      <Typography variant="h6">
                        Syncing Staking Contract
                      </Typography>
                      <>
                        <div className={classes.submitButtonContainer}>
                            <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={true}
                                showLoadingIcon={true}
                                text={'Syncing Staking Contract...'}
                              />
                            </div>
                        </div>
                      </>
                  </Card>
                </animated.div>
              </>
            }
          </>
        }
      </div>
    </>
  );
}

export default StakePortalV3;