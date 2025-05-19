import React, { useState, useEffect, useId, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query'

import { useNavigate } from 'react-router-dom';

import { animated, useSpring } from '@react-spring/web';

import BigNumber from 'bignumber.js';

import { utils } from 'ethers';

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

import { useAccount, useReadContract, useBlockNumber } from 'wagmi';

import SingleTokenCard from './SingleTokenCard';
import SingleTokenCardLoading from './SingleTokenCardLoading';

import FloatingActionButton from './FloatingActionButton';

import {
  countdownToTimestamp,
  sleep,
  priceFormat,
} from '../utils';

import {
  STAKING_V3_CONTRACT_ADDRESS,
  STAKING_V3_PROPYKEYS_MODULE_ADDRESS,
  STAKING_V3_LP_MODULE_ADDRESS,
  STAKING_V3_PRO_MODULE_ADDRESS,
  STAKING_V3_PROPYKEYS_ADDRESS,
  STAKING_V3_PROPYOG_ADDRESS,
  STAKING_V3_UNISWAP_NFT_ADDRESS,
  STAKING_V3_PRO_ADDRESS,
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
  STAKING_V3_PK_MODULE_ID,
} from '../utils/constants';

import {
  IAssetRecord,
  IBalanceRecord,
  IPaginationNoOptional,
} from '../interfaces';

import ERC20ABI from '../abi/ERC20ABI.json';
import PropyNFTABI from '../abi/PropyNFTABI.json';
import StakingV3CombinedErrorsABI from '../abi/StakingV3CombinedErrorsABI';
import PropyKeyStakingV3ModuleABI from '../abi/PropyKeyStakingV3ModuleABI.json';

import {
  AccountBalanceService,
  StakeService,
} from '../services/api';

import { 
  useStakerModuleUnlockTime,
  // useStakerModuleLockedAtTime,
  useUnifiedWriteContract,
  usePropyKeyPROValueV3,
  useOpenSeasonEndTimeV3,
  useApproxStakerRewardsPendingByModuleV3,
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

interface IRealTimeCountdownZone {
  mode: 'countdowns' | 'tips',
  classes: any
  stakerRewardOnModule: any
  stakerUnlockTime: number
  openSeasonEndTime: number
}

const RealTimeCountdownZone = (props: IRealTimeCountdownZone) => {

  const {
    mode,
    classes,
    stakerRewardOnModule,
    stakerUnlockTime,
    openSeasonEndTime,
  } = props;

  const { 
    secondsRemaining: secondsRemainingUnlockTime,
    formattedCountdown: formattedCountdownUnlockTime,
  } = useCountdownSeconds(stakerUnlockTime);

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
                  <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Unclaimed rewards detected:</strong><br/>You <strong>may not</strong> increase your stake using a wallet address with unclaimed rewards on this staking module, if you would like to stake more PropyKeys, please first claim your current rewards by unstaking, or alternatively stake the additional PropyKeys from a different wallet address.</Typography>
                :
                  <Typography className={classes.buttonSubtitle} variant="subtitle2">Staking causes a 3-day lockup period on all staked tokens, including tokens that are already staked.</Typography>
                }
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
              <Tooltip placement="top" title={`Time remaining on your currently-active lockup on this PropyKeys staking module.`}>
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

interface INftAssets {
  [key: string]: IAssetRecord
}

const getApproveNFTButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingPropyKeysApprovalForAllTx: boolean,
) => {
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingPropyKeysApprovalForAllTx) {
    return "Granting Allowance...";
  }

  return "Grant NFT Allowance";
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

const getStakeButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingStakeTx: boolean,
  isSyncingStaking: boolean,
  openSeasonEndTime: number,
  stakerRewardOnModule: number
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

  if(openSeasonEndTime < Math.floor(new Date().getTime() / 1000)) {
    return "Staking Entry Closed"
  }

  if(stakerRewardOnModule > 0) {
    return "Pending Unclaimed Rewards"
  }
  
  return "Stake";
}

const getActiveStep = (
  mode: string,
  selectedTokenAddress: string | false,
  isPropyKeysStakingContractApproved: boolean,
  isPropyOGsStakingContractApproved: boolean,
) => {
  // todo
  // use currentStakingContractAllowance & requiredAllowance
  if(mode === "enter") {
    if(selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS) {
      // if (!isPropyKeysStakingContractApproved) {
      //   return 0;
      // } else if (isPropyKeysStakingContractApproved && !isSufficientAllowancePRO) {
      //   return 1;
      // } else if(isPropyKeysStakingContractApproved && isSufficientAllowancePRO) {
      //   return 2;
      // } 
      if (!isPropyKeysStakingContractApproved) {
        return 0;
      } else if (isPropyKeysStakingContractApproved) {
        return 1;
      }
    } else if(selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS) {
      // if (!isPropyOGsStakingContractApproved) {
      //   return 0;
      // } else if (isPropyOGsStakingContractApproved && !isSufficientAllowancePRO) {
      //   return 1;
      // } else if(isPropyOGsStakingContractApproved && isSufficientAllowancePRO) {
      //   return 2;
      // }
      if (!isPropyOGsStakingContractApproved) {
        return 0;
      } else if (isPropyOGsStakingContractApproved) {
        return 1;
      }
    }
  } else if (mode === "leave") {
    return 0;
  }
  return 0;
}

const StakePortalV3PropyKeysModule = (props: IStakeEnter) => {

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

  const maxSelection = 100;

  let isDeprecatedStakingVersion = false;

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { chain } = useAccount();

  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [propyKeysNFT, setPropyKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [propyKeysNFTPaginationData, setPropyKeysNFTPaginationData] = useState<false | IPaginationNoOptional>(false);
  const [maxStakedLoadCount, setMaxStakedLoadCount] = useState(100);
  const [maxUnstakedLoadCount, setMaxUnstakedLoadCount] = useState(100);
  const [ogKeysNFT, setOGKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [ogKeysNFTPaginationData, setOGKeysNFTPaginationData] = useState<false | IPaginationNoOptional>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<false | string>(false);
  const [activeStep, setActiveStep] = useState<0|1|2>(0);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // const [showRequireTenModal, setShowRequireTenModal] = useState(false);
  const [isSyncingStaking, setIsSyncingStaking] = useState(false);

  const { 
    address,
  } = useAccount();

  const actionZoneSpring = useSpring({
    from: {
      bottom: '0px',
      transform: 'translateY(100%)',
    },
    to: {
      bottom: (selectedTokenIds.length > 0 && !isSyncingStaking) ? '100px' : '0px',
      transform: `translateY(${(selectedTokenIds.length > 0 && !isSyncingStaking) ? '0%' : '100%'})`,
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
    setIsLoading(true);
  }, [version])

  useEffect(() => {
    setSelectedTokenIds([]);
    setSelectedTokenAddress(false);
  }, [triggerUpdateIndex])

  // refactor into react-query
  useEffect(() => {
    let isMounted = true;
    const getStakingTokens = async () => {
      if(address) {
        if(selectedStakingModule === "propykeys") {
          let results;
          if (mode === "enter") {
            results = await Promise.all([
              AccountBalanceService.getAccountBalancesByAssetIncludeStakingStatus(address, STAKING_V3_PROPYKEYS_ADDRESS, maxUnstakedLoadCount),
              AccountBalanceService.getAccountBalancesByAssetIncludeStakingStatus(address, STAKING_V3_PROPYOG_ADDRESS, maxUnstakedLoadCount),
            ])
          } else if(mode === "leave") {
            results = await Promise.all([
              AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, STAKING_V3_PROPYKEYS_ADDRESS, STAKING_V3_CORE_CONTRACT_ADDRESS, maxStakedLoadCount),
              AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, STAKING_V3_PROPYOG_ADDRESS, STAKING_V3_CORE_CONTRACT_ADDRESS, maxStakedLoadCount),
            ])
          }
          if(isMounted) {
            let propykeysRenderResults : IBalanceRecord[] = [];
            let assetResults : INftAssets = {};
            if(results?.[0]) {
              for(let nftRecord of results?.[0]?.data?.data) {
                if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
                  assetResults[nftRecord.asset.address] = nftRecord.asset;
                }
                propykeysRenderResults = [...propykeysRenderResults, nftRecord];
              }
            }
            let ogRenderResults : IBalanceRecord[] = [];
            if(results?.[1]) {
              for(let nftRecord of results?.[1]?.data?.data) {
                if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
                  assetResults[nftRecord.asset.address] = nftRecord.asset;
                }
                ogRenderResults = [...ogRenderResults, nftRecord];
              }
            }
            if(isMounted) {
              setNftAssets(assetResults);
              setPropyKeysNFT(propykeysRenderResults);
              if(results?.[0]?.data?.metadata?.pagination) {
                setPropyKeysNFTPaginationData(results?.[0]?.data?.metadata?.pagination);
              }
              setOGKeysNFT(ogRenderResults);
              if(results?.[1]?.data?.metadata?.pagination) {
                setOGKeysNFTPaginationData(results?.[1]?.data?.metadata?.pagination);
              }
              setIsLoading(false);
            }
          }
        } else {
          setIsLoading(false);
        }
      }
    }
    getStakingTokens();
    return () => {
      isMounted = false;
    }
  }, [address, mode, triggerUpdateIndex, version, maxUnstakedLoadCount, maxStakedLoadCount, selectedStakingModule])

  const handleBalanceRecordSelected = (balanceRecord: IBalanceRecord) => {
    let useCurrentSelection = balanceRecord.asset_address === selectedTokenAddress ? [...selectedTokenIds] : [];
    let indexOfCurrentEntry = useCurrentSelection.indexOf(Number(balanceRecord.token_id));
    if(indexOfCurrentEntry > -1) {
      let newSelection = useCurrentSelection.slice(0, indexOfCurrentEntry).concat(useCurrentSelection.slice(indexOfCurrentEntry + 1));
      if(newSelection?.length > 0) {
        setSelectedTokenAddress(balanceRecord.asset_address);
      } else {
        setSelectedTokenAddress(false);
      }
      setSelectedTokenIds(newSelection);
    } else {
      let newSelection = [...useCurrentSelection, Number(balanceRecord.token_id)];
      if(newSelection?.length > 0) {
        setSelectedTokenAddress(balanceRecord.asset_address);
      } else {
        setSelectedTokenAddress(false);
      }
      setSelectedTokenIds(newSelection);
    }
    setLastErrorMessage(false);
  };

  const selectAllOfCurrentCollection = () => {
    setLastErrorMessage(false);
    console.log({selectedTokenAddress, STAKING_V3_PROPYKEYS_ADDRESS, STAKING_V3_PROPYOG_ADDRESS})
    if(selectedTokenAddress) {
      if(selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS) {
        let newSelection = (propyKeysNFT && (propyKeysNFT?.length > 0)) ? propyKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        setSelectedTokenIds(newSelection);
      }
      if(selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS) {
        let newSelection = (ogKeysNFT && (ogKeysNFT?.length > 0)) ? ogKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        setSelectedTokenIds(newSelection);
      }
    }
  }

  const deselectAllOfCurrentCollection = () => {
    setLastErrorMessage(false);
    setSelectedTokenIds([]);
    setSelectedTokenAddress(false);
  }

  const { 
    data: dataPropyKeysIsStakingContractApproved,
    queryKey: dataPropyKeysIsStakingContractApprovedQueryKey
  } = useReadContract({
    address: STAKING_V3_PROPYKEYS_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, STAKING_V3_PROPYKEYS_MODULE_ADDRESS],
  });

  const { 
    data: dataPropyOGsIsStakingContractApproved,
    queryKey: dataPropyOGsIsStakingContractApprovedQueryKey,
  } = useReadContract({
    address: STAKING_V3_PROPYOG_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, STAKING_V3_PROPYKEYS_MODULE_ADDRESS],
  });

  const { 
    data: dataUniswapLPsIsStakingContractApproved,
    queryKey: dataUniswapLPsIsStakingContractApprovedQueryKey,
  } = useReadContract({
    address: STAKING_V3_UNISWAP_NFT_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, STAKING_V3_LP_MODULE_ADDRESS],
  });

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
    data: stakingContractStakingPowerAllowance,
    queryKey: stakingContractStakingPowerAllowanceQueryKey
  } = useReadContract({
    address: STAKING_V3_CONTRACT_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address, STAKING_V3_CONTRACT_ADDRESS],
  });

  const { 
    data: sharesIssuedAgainstSelectionPK,
    queryKey: sharesIssuedAgainstSelectionPKQueryKey,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useReadContract({
    address: STAKING_V3_PROPYKEYS_MODULE_ADDRESS,
    abi: PropyKeyStakingV3ModuleABI,
    functionName: 'getSharesIssued',
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakerUnlockTimePropyKeys,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerModuleUnlockTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_PK_MODULE_ID,
  );

  const { 
    data: proValueOfSelection,
    isLoading: isLoadingProValueOfSelection,
  } = usePropyKeyPROValueV3(
    STAKING_V3_CONTRACT_ADDRESS,
    selectedTokenAddress ? selectedTokenAddress : "",
    selectedTokenIds,
    chain ? chain.id : undefined,
  )

  const { 
    data: openSeasonEndTime,
    // isLoading: isLoadingOpenSeasonEndTime,
  } = useOpenSeasonEndTimeV3(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    chain ? chain.id : undefined
  )

  const { 
    data: stakerRewardOnModule,
    // isLoading: isLoadingStakerRewardOnModule,
  } = useApproxStakerRewardsPendingByModuleV3(
    STAKING_V3_PK_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  // const { 
  //   data: moduleLockedAtTime,
  //   // isLoading: isLoadingModuleUnlockTime,
  // } = useStakerModuleLockedAtTime(
  //   STAKING_V3_CORE_CONTRACT_ADDRESS,
  //   address,
  //   chain ? chain.id : undefined,
  //   STAKING_V3_PK_MODULE_ID,
  // );

  useEffect(() => {

    const queryKeys = [
      dataPropyKeysIsStakingContractApprovedQueryKey,
      sharesIssuedAgainstSelectionPKQueryKey,
      stakingContractStakingPowerAllowanceQueryKey,
      dataPropyOGsIsStakingContractApprovedQueryKey,
      dataUniswapLPsIsStakingContractApprovedQueryKey,
      stakingContractPROAllowanceQueryKey,
    ];

    if (queryKeys.every(Boolean)) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [
    blockNumber,
    queryClient,
    dataPropyKeysIsStakingContractApprovedQueryKey,
    sharesIssuedAgainstSelectionPKQueryKey,
    stakingContractStakingPowerAllowanceQueryKey,
    dataPropyOGsIsStakingContractApprovedQueryKey,
    dataUniswapLPsIsStakingContractApprovedQueryKey,
    stakingContractPROAllowanceQueryKey,
  ]);

  // --------------------------------------

  // APPROVE PROPYKEYS NFT CALLS BELOW

  const { 
    executeTransaction: executePerformPropyKeysSetApprovalForAllTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformPropyKeysSetApprovalForAllTx,
    isAwaitingTx: isAwaitingPerformPropyKeysSetApprovalForAllTx,
    // isLoading: isLoadingPerformPropyKeysSetApprovalForAllTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_PROPYKEYS_ADDRESS,
      abi: PropyNFTABI,
      functionName: 'setApprovalForAll',
      args: [STAKING_V3_PROPYKEYS_MODULE_ADDRESS, true],
    },
    successToastMessage: `PropyKeys NFT Approval granted to staking contract!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE PROPYKEYS NFT CALLS ABOVE

  // --------------------------------------

  // APPROVE OG NFT CALLS BELOW

  const { 
    executeTransaction: executePerformOGSetApprovalForAllTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformOGSetApprovalForAllTx,
    isAwaitingTx: isAwaitingPerformOGSetApprovalForAllTx,
    // isLoading: isLoadingPerformOGSetApprovalForAllTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_PROPYOG_ADDRESS,
      abi: PropyNFTABI,
      functionName: 'setApprovalForAll',
      args: [STAKING_V3_PROPYKEYS_MODULE_ADDRESS, true],
    },
    successToastMessage: `PropyKeys NFT Approval granted to staking contract!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE OG NFT CALLS ABOVE

  // --------------------------------------

  // STAKE CALLS BELOW

  const { 
    executeTransaction: executePerformStakeTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformStakeTx,
    isAwaitingTx: isAwaitingPerformStakeTx,
    // isLoading: isLoadingPerformStakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'enterWithOnlyPropyKeys',
      args: [selectedTokenAddress, selectedTokenIds],
    },
    successToastMessage: `Stake success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PK');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PK');
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false);
      }
      syncStaking();
    },
    onError: (error: any) => {
      let errorMessage : string | false = false;
      if (error === 'NotOpenSeason') {
        errorMessage = `Entry has closed for the current staking season, please wait for the entry period at the beginning of the next season to enter.`
      } else if (error === 'NotFullRangePosition') {
        errorMessage = `Only full range position NFTs are eligible (-887200 to 887200)`
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
    executeTransaction: executePerformUnstakeTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformUnstakeTx,
    isAwaitingTx: isAwaitingPerformUnstakeTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'leaveWithPropyKeys',
      args: [selectedTokenAddress, selectedTokenIds],
    },
    successToastMessage: `Unstake success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PK');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_PK');
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
    let latestActiveStep : 0|1|2 = getActiveStep(
      mode,
      selectedTokenAddress,
      Boolean(dataPropyKeysIsStakingContractApproved),
      Boolean(dataPropyOGsIsStakingContractApproved),
    );
    setActiveStep(latestActiveStep);
  }, [mode, selectedTokenAddress, dataPropyKeysIsStakingContractApproved, dataPropyOGsIsStakingContractApproved, dataUniswapLPsIsStakingContractApproved, stakingContractPROAllowance, sharesIssuedAgainstSelectionPK, stakingContractStakingPowerAllowance])

  const isAwaitingWalletInteraction = useMemo(() => {
    return (
      isAwaitingWalletInteractionPerformPropyKeysSetApprovalForAllTx ||
      isAwaitingWalletInteractionPerformOGSetApprovalForAllTx ||
      isAwaitingWalletInteractionPerformStakeTx ||
      isAwaitingWalletInteractionPerformUnstakeTx
    );
  }, [
    isAwaitingWalletInteractionPerformPropyKeysSetApprovalForAllTx,
    isAwaitingWalletInteractionPerformOGSetApprovalForAllTx,
    isAwaitingWalletInteractionPerformStakeTx,
    isAwaitingWalletInteractionPerformUnstakeTx,
  ]);

  const disableSelectionAdjustments = useMemo(() => {
    return (
      isAwaitingPerformPropyKeysSetApprovalForAllTx || 
      isAwaitingWalletInteraction || 
      isAwaitingPerformOGSetApprovalForAllTx || 
      isAwaitingPerformStakeTx || 
      isAwaitingPerformUnstakeTx || 
      isSyncingStaking
    )
  }, [
    isAwaitingPerformPropyKeysSetApprovalForAllTx, 
    isAwaitingWalletInteraction, 
    isAwaitingPerformOGSetApprovalForAllTx, 
    isAwaitingPerformStakeTx,
    isAwaitingPerformUnstakeTx,
    isSyncingStaking
  ])

  const getMaxHelperText = () => {
    let balance = selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS ? Number(propyKeysNFT ? propyKeysNFT.length : 0) : Number(ogKeysNFT ? ogKeysNFT?.length : 0);
    let isBalanceMoreThanMaxSelection = balance > maxSelection;
    let relevantTokenName = selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS ? "PropyKey" : "PropyOG";
    let actionName = mode === "enter" ? "stake" : "unstake";
    let currentTokenState = mode === "enter" ? "unstaked" : "staked";
    return (
      <>
        Maximum {maxSelection} tokens per transaction, you have <strong>{balance} {currentTokenState} {relevantTokenName}{balance === 1 ? "" : "s"}</strong>, therefore you {isBalanceMoreThanMaxSelection ? <>would need to perform <strong>{Math.ceil(balance / maxSelection)} separate {actionName} transactions</strong> to {actionName} all of your {currentTokenState} tokens</> : <>can {actionName} all of your {currentTokenState} tokens in a single transaction</>}
      </>
    )
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
        {selectedStakingModule === "propykeys" &&
          <>
            {((!isDeprecatedStakingVersion) || (mode === "leave")) &&
              <>
                <Grid className={(isLoading) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {!(isLoading) && ((ogKeysNFT && ogKeysNFT.length > 0) || (propyKeysNFT && propyKeysNFT.length > 0)) &&
                    <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                      <Typography variant="body1" style={{textAlign: 'left'}}>
                        {(propyKeysNFTPaginationData && propyKeysNFTPaginationData?.total > 0) &&
                          <>
                            {`Found ${propyKeysNFTPaginationData && propyKeysNFTPaginationData?.total > 0 ? propyKeysNFTPaginationData.total : 0} PropyKeys`}<br/>
                          </>
                        }
                        {(ogKeysNFTPaginationData && ogKeysNFTPaginationData?.total > 0) &&
                          <>
                            {`Found ${ogKeysNFTPaginationData && ogKeysNFTPaginationData?.total > 0 ? ogKeysNFTPaginationData.total : 0} PropyOG tokens`}<br/>
                          </>
                        }
                        Please click on the token(s) that you would like to {mode === "enter" ? "stake" : "unstake"}
                      </Typography>
                    </Grid>
                  }
                  {!(isLoading) && propyKeysNFT && propyKeysNFT.map((balanceRecord, index) => (
                    <Grid key={`${uniqueId}-single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCard disabled={(selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
                    </Grid>  
                  ))}
                  {!(isLoading) && ogKeysNFT && ogKeysNFT.map((balanceRecord, index) => (
                    <Grid key={`${uniqueId}-single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCard disabled={(selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
                    </Grid>  
                  ))}
                  {(isLoading) && 
                    <>
                      <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                        <Typography variant="body1" style={{textAlign: 'left'}}>
                          Loading...
                        </Typography>
                      </Grid>
                      {
                        Array.from({length: 15}).map((entry, index) => 
                          <Grid key={`${uniqueId}-single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                            <SingleTokenCardLoading />
                          </Grid>
                        )
                      }
                    </>
                  }
                  {
                    (mode === "enter") && ((ogKeysNFT && ogKeysNFT?.length > 0) || (propyKeysNFT && propyKeysNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count)) && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count)))}
                          onClick={() => setMaxUnstakedLoadCount(maxUnstakedLoadCount + 100)}
                          showLoadingIcon={isLoading}
                          text={(
                            (propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count))
                            && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {
                    (mode === "leave") && ((ogKeysNFT && ogKeysNFT?.length > 0) || (propyKeysNFT && propyKeysNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count)) && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count)))}
                          onClick={() => setMaxStakedLoadCount(maxStakedLoadCount + 100)}
                          showLoadingIcon={isLoading}
                          text={(
                            (propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count))
                            && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {!(isLoading) && (ogKeysNFT && ogKeysNFT.length === 0) && (propyKeysNFT && propyKeysNFT.length === 0) &&
                    <Grid key={`${uniqueId}-single-token-card-loading-unfound`} item xs={4} sm={8} md={12} lg={20} xl={30}>
                      <Typography variant="h6" style={{textAlign: 'left'}}>
                          {mode === "enter" ? "No unstaked tokens found" : "No staked tokens found"}
                      </Typography>
                    </Grid>
                  }
                </Grid>
                <animated.div className={classes.floatingActionZone} style={actionZoneSpring}>
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
                            deselectAllOfCurrentCollection();
                          }}
                        />
                      </div>
                      <Typography variant="h6">
                        {mode === "enter" ? "Stake " : "Unstake "}{selectedTokenIds.length}{selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS ? " PropyKey" : " PropyOG"}{selectedTokenIds.length === 1 ? "" : "s"}
                      </Typography>
                      <Typography variant="caption" style={{lineHeight: 1.6}}>
                        {getMaxHelperText()}
                      </Typography>
                      <Box className={classes.selectionOptionsContainer}>
                        <div className={classes.selectionOptionsSpacer}>
                          <Button
                            // onClick={}
                            // variant={'outlined'}
                            size={'small'}
                            color={'secondary'}
                            onClick={() => deselectAllOfCurrentCollection()}
                            disabled={disableSelectionAdjustments}
                            // color={color}
                            // disabled={isLoading}
                            // style={{width: width}}
                            // className={[getBorderColorClass(color), switchMode ? '' : "outlined-icon-button"].join(" ")}
                          >
                            Clear All
                          </Button>
                          <Button
                            // onClick={}
                            // variant={'outlined'}
                            size={'small'}
                            color={'secondary'}
                            onClick={() => selectAllOfCurrentCollection()}
                            disabled={disableSelectionAdjustments}
                            // color={color}
                            // disabled={isLoading}
                            // style={{width: width}}
                            // className={[getBorderColorClass(color), switchMode ? '' : "outlined-icon-button"].join(" ")}
                          >
                            Select All
                          </Button>
                        </div>
                      </Box>
                      {mode === "enter" &&
                        <>
                          <Box className={classes.stepContainer}>
                            <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                              {/* TODO feed getActiveStep the proper allowance required param */}
                              <Stepper activeStep={activeStep} alternativeLabel>
                                <Step key={`${uniqueId}-Approve NFT`}>
                                  <StepLabel>{"Approve NFT"}</StepLabel>
                                </Step>
                                {/* <Step key={`${uniqueId}-Approve PRO`}>
                                  <StepLabel>{"Approve PRO"}</StepLabel>
                                </Step> */}
                                <Step key={`${uniqueId}-Enter Staking`}>
                                  <StepLabel>{"Enter Staking"}</StepLabel>
                                </Step>
                              </Stepper>
                            </div>
                          </Box>
                          <Typography style={{marginTop: '16px'}} className={['flex-center'].join(" ")} variant="subtitle2">
                            pSTAKE estimate: {(isLoadingProValueOfSelection || !proValueOfSelection) ? "Loading..." : priceFormat((utils.formatUnits(new BigNumber(proValueOfSelection.toString()).multipliedBy(100).toString(), 8)).toString(), 2, "pSTAKE")}
                            <Tooltip placement="top" title={`This pSTAKE estimate represents how much staking power you would receive from creating this staking position.`}>
                              <HelpIcon className={'tooltip-helper-icon'} />
                            </Tooltip>
                          </Typography>
                          <RealTimeCountdownZone
                            mode="countdowns"
                            classes={classes}
                            stakerRewardOnModule={stakerRewardOnModule}
                            stakerUnlockTime={stakerUnlockTimePropyKeys}
                            openSeasonEndTime={openSeasonEndTime}
                          />
                          <div className={classes.submitButtonContainer}>
                            {
                              (
                                selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS
                                && activeStep === 0
                              ) &&
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={isAwaitingPerformPropyKeysSetApprovalForAllTx || isAwaitingWalletInteraction}
                                onClick={() => executePerformPropyKeysSetApprovalForAllTx()}
                                showLoadingIcon={isAwaitingPerformPropyKeysSetApprovalForAllTx || isAwaitingWalletInteraction}
                                text={getApproveNFTButtonText(isAwaitingWalletInteraction, isAwaitingPerformPropyKeysSetApprovalForAllTx)}
                              />
                            }
                            {
                              (
                                (selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)
                                && activeStep === 0
                              ) &&
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={isAwaitingPerformOGSetApprovalForAllTx || isAwaitingWalletInteraction}
                                onClick={() => executePerformOGSetApprovalForAllTx()}
                                showLoadingIcon={isAwaitingPerformOGSetApprovalForAllTx || isAwaitingWalletInteraction}
                                text={getApproveNFTButtonText(isAwaitingWalletInteraction, isAwaitingPerformOGSetApprovalForAllTx)}
                              />
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
                                ((selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS) || (selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS))
                                && activeStep === 1
                              ) &&
                              <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                                {/* <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2">PRO Balance: {priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value : 0), 8)), 2, 'PRO', false, true)}</Typography>
                                <Typography className={classes.buttonTitle} variant="subtitle2">{priceFormat(Number(utils.formatUnits(Number(minimumRequiredPROAllowance ? minimumRequiredPROAllowance : 0), 8)), 2, 'PRO', false, true)} Required</Typography> */}
                                <RealTimeCountdownZone
                                  mode="tips"
                                  classes={classes}
                                  stakerRewardOnModule={stakerRewardOnModule}
                                  stakerUnlockTime={stakerUnlockTimePropyKeys}
                                  openSeasonEndTime={openSeasonEndTime}
                                />
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingWalletInteraction || isAwaitingPerformStakeTx || isSyncingStaking || (Number(openSeasonEndTime) < Math.floor(new Date().getTime() / 1000)) || (Number(stakerRewardOnModule) > 0)}
                                  onClick={() => {executePerformStakeTx();setLastErrorMessage(false)}}
                                  showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformStakeTx || isSyncingStaking}
                                  text={getStakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformStakeTx, isSyncingStaking, Number(openSeasonEndTime ? openSeasonEndTime : 0), Number(stakerRewardOnModule ? stakerRewardOnModule : 0))}
                                />
                              </div>
                            }
                          </div>
                        </>
                      }
                      {mode === "leave" &&
                        <>
                          <Box className={classes.stepContainer}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                              {/* <Step key={`${uniqueId}-Approve pSTAKE`}>
                                <StepLabel>{"Approve pSTAKE"}</StepLabel>
                              </Step> */}
                              <Step key={`${uniqueId}-Unstake`}>
                                <StepLabel>{"Unstake"}</StepLabel>
                              </Step>
                            </Stepper>
                          </Box>
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
                              </div>
                            } */}
                            {
                              (
                                activeStep === 0
                              ) &&
                              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                {(Number(stakerUnlockTimePropyKeys) * 1000 < new Date().getTime()) &&
                                  <FloatingActionButton
                                    className={classes.submitButton}
                                    buttonColor="secondary"
                                    disabled={isAwaitingPerformUnstakeTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimePropyKeys) * 1000 > new Date().getTime()) || isSyncingStaking}
                                    onClick={() => executePerformUnstakeTx()}
                                    showLoadingIcon={isAwaitingPerformUnstakeTx || isAwaitingWalletInteraction || isSyncingStaking}
                                    text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformUnstakeTx, isSyncingStaking)}
                                  />
                                }
                                {(Number(stakerUnlockTimePropyKeys) * 1000 > new Date().getTime()) &&
                                  <Typography className={classes.buttonSubtitle} variant="subtitle2"><strong>Locked for {countdownToTimestamp(Number(stakerUnlockTimePropyKeys), "")}</strong></Typography>
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
                {/* {showRequireTenModal &&
                  <Dialog
                    open={showRequireTenModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      Unmet Staking Requirement
                    </DialogTitle>
                    <DialogContent>
                      <Typography variant="subtitle2" style={{fontWeight: 400}}>
                        In order to stake a Tier 1 PropyKey, you must have at least 10 stakeable PropyKey NFTs (this is calculated by combining your PropyKey & PropyOG balances with the quantities of PropyKey & PropyOG tokens that you have already staked). This rule only applies when trying to stake a Tier 1 PropyKey. PropyOG NFTs and PropyKeys with a Tier higher than 1 can be staked without restriction.
                      </Typography>
                    </DialogContent>
                    <DialogActions style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Button onClick={() => setShowRequireTenModal(false)} autoFocus>
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                } */}
              </>
            }
          </>
        }
      </div>
    </>
  );
}

export default StakePortalV3PropyKeysModule;