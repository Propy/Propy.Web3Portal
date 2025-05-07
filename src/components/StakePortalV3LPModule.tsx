import React, { useState, useEffect, useId, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query'

import { useNavigate } from 'react-router-dom';

import { animated, useSpring } from '@react-spring/web';

import { useQuery } from '@tanstack/react-query';

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
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { useAccount, useReadContract, useBlockNumber } from 'wagmi';

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
  STAKING_V3_LP_MODULE_ADDRESS,
  STAKING_V3_UNISWAP_NFT_ADDRESS,
  STAKING_V3_UNISWAP_LP_HELPER_ADDRESS,
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  PROPY_LIGHT_BLUE,
  STAKING_V3_LP_MODULE_ID,
} from '../utils/constants';

import {
  IAssetRecord,
  IBalanceRecord,
  IPaginationNoOptional,
} from '../interfaces';

import ERC20ABI from '../abi/ERC20ABI.json';
import PropyNFTABI from '../abi/PropyNFTABI.json';
import StakingV3CombinedErrorsABI from '../abi/StakingV3CombinedErrorsABI';
import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';
import LPNFTHelperABI from '../abi/LPNFTHelperABI.json';

import {
  AccountBalanceService,
  StakeService,
  GeoService,
} from '../services/api';

import { 
  useStakerModuleUnlockTime,
  // useStakerModuleLockedAtTime,
  useUnifiedWriteContract,
  useApproxStakerRewardsPendingByModuleV3
} from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
  version: number
  selectedStakingModule: false | "pro" | "lp" | "propykeys"
  setSelectedStakingModule: (module: false | "pro" | "lp" | "propykeys") => void
}

type UniswapPositionDetailsRaw = [
  liquidity: bigint,    // uint128 - current liquidity amount
  tickUpper: number,    // int24 - upper tick boundary
  tickLower: number,    // int24 - lower tick boundary
  amount0: bigint,      // uint256 - amount of token0 
  amount1: bigint,      // uint256 - amount of token1
  positionEstimateToken0: bigint // uint256 - estimated PRO value of position
]

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
      maxWidth: '400px',
      width: 'calc(100% - 16px)',
      transform: 'translateY(0%)',
      textAlign: 'center',
      zIndex: 1200,
    },
    floatingActionZoneCard: {
      padding: theme.spacing(2),
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

const getStakeButtonTextLP = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingStakeTx: boolean,
  isSyncingStaking: boolean,
  positionDetails: UniswapPositionDetailsRaw | undefined,
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

  let positionError = getLpPositionDetailsError(positionDetails);
  if(positionError) {
    return positionError
  }
  
  return "Stake";
}

const getLpPositionDetailsError = (
  positionDetails: UniswapPositionDetailsRaw | undefined,
) => {
  if(!positionDetails) {
    return "Awaiting Position Details"
  }
  if(positionDetails && (positionDetails[1] !== 887200 || positionDetails[2] !== -887200)) {
    return "Only Full-Range Positions Supported"
  }
  if(positionDetails && (Number(positionDetails[0]) === 0)) {
    return "Position Has No Liquidity"
  }
  return false;
}

const getActiveStep = (
  mode: string,
  selectedTokenAddress: string | false,
  isUniswapLPsStakingContractApproved: boolean,
  currentStakingContractAllowance: string,
  selectedLockupPeriodDays: 0|3|60|90|180|365,
) => {
  if(mode === "enter") {
    if(selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS) {
      if (!isUniswapLPsStakingContractApproved) {
        return 0;
      } else if(!selectedLockupPeriodDays) {
        return 1;
      } else if (isUniswapLPsStakingContractApproved && selectedLockupPeriodDays) {
        return 2;
      }
    }
  } else if (mode === "leave") {
    return 0;
  }
  return 0;
}

const StakePortalV3LPModule = (props: IStakeEnter) => {

  const {
    mode,
    postStakeSuccess,
    version,
    selectedStakingModule,
    // setSelectedStakingModule,
  } = props;

  const navigate = useNavigate();

  // const [selectedStakingModule, setSelectedStakingModule] = useState<false | "pro" | "lp" | "propykeys">(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<false | string>(false);

  const uniqueId = useId();

  const classes = useStyles();

  const maxSelectionLP = 1;

  let isDeprecatedStakingVersion = false;

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { chain } = useAccount();

  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [uniswapLPNFT, setUniswapLPNFT] = useState<false | IBalanceRecord[]>(false);
  const [uniswapLPNFTPaginationData, setUniswapLPNFTPaginationData] = useState<false | IPaginationNoOptional>(false);
  const [maxStakedLoadCount, setMaxStakedLoadCount] = useState(100);
  const [maxUnstakedLoadCount, setMaxUnstakedLoadCount] = useState(100);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<false | string>(false);
  const [activeStep, setActiveStep] = useState<0|1|2>(0);
  const [selectedLockupPeriodDays, setSelectedLockupPeriodDays] = useState<0|3|60|90|180|365>(0);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // const [showRequireTenModal, setShowRequireTenModal] = useState(false);
  const [isSyncingStaking, setIsSyncingStaking] = useState(false);
  const [lastSelectedUniswapTokenId, setLastSelectedUniswapTokenId] = useState(0);
  const [acceptsEarlyUnstake, setAcceptEarlyUnstake] = useState(false);

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
        if (selectedStakingModule === "lp") {
          let results;
          if (mode === "enter") {
            results = await Promise.all([
              AccountBalanceService.getAccountBalancesByAssetIncludeStakingStatus(address, STAKING_V3_UNISWAP_NFT_ADDRESS, maxUnstakedLoadCount),
            ])
          } else if(mode === "leave") {
            results = await Promise.all([
              AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, STAKING_V3_UNISWAP_NFT_ADDRESS, STAKING_V3_CORE_CONTRACT_ADDRESS, maxStakedLoadCount),
            ])
          }
          if(isMounted) {
            let uniswapLpNftRenderResults : IBalanceRecord[] = [];
            let assetResults : INftAssets = {};
            if(results?.[0]) {
              for(let nftRecord of results?.[0]?.data?.data) {
                if(nftRecord?.asset?.address && !assetResults[nftRecord?.asset?.address]) {
                  assetResults[nftRecord.asset.address] = nftRecord.asset;
                }
                uniswapLpNftRenderResults = [...uniswapLpNftRenderResults, nftRecord];
              }
            }
            if(isMounted) {
              setNftAssets(assetResults);
              setUniswapLPNFT(uniswapLpNftRenderResults);
              if(results?.[0]?.data?.metadata?.pagination) {
                setUniswapLPNFTPaginationData(results?.[0]?.data?.metadata?.pagination);
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

  const handleBalanceRecordSelectedSingle = (balanceRecord: IBalanceRecord) => {
    let useCurrentSelection = balanceRecord.asset_address === selectedTokenAddress ? [...selectedTokenIds] : [];
    let indexOfCurrentEntry = useCurrentSelection.indexOf(Number(balanceRecord.token_id));
    let newSelection = [Number(balanceRecord.token_id)];
    if(newSelection?.length > 0 && indexOfCurrentEntry === -1) {
      if(balanceRecord?.nft?.asset_address === STAKING_V3_UNISWAP_NFT_ADDRESS) {
        setLastSelectedUniswapTokenId(Number(balanceRecord.nft.token_id));
      } else {
        setLastSelectedUniswapTokenId(0);
      }
      setSelectedTokenAddress(balanceRecord.asset_address);
      setSelectedTokenIds(newSelection);
    } else {
      setSelectedTokenAddress(false);
      setSelectedTokenIds([]);
    }
    setLastErrorMessage(false);
  };

  const { 
    data: clientCountry,
    isLoading: isLoadingGeoLocation,
  } = useQuery({
    queryKey: ['stakeGeoLocation', mode],
    queryFn: async () => {
      let geoLocateResponse = await GeoService.geoLocateClient();
      if (geoLocateResponse?.status && geoLocateResponse?.data) {
        return geoLocateResponse?.data?.info?.country;
      }
      return null;
    },
  });
  
  console.log({clientCountry})

  const {
    data: lastSelectedUniswapTokenPositionDetails,
    queryKey: lastSelectedUniswapTokenPositionDetailsQueryKey
  } = useReadContract({
    address: STAKING_V3_UNISWAP_LP_HELPER_ADDRESS,
    abi: LPNFTHelperABI,
    functionName: 'getPositionDetails',
    args: [lastSelectedUniswapTokenId],
  }) as { 
    data: UniswapPositionDetailsRaw | undefined; 
    queryKey: readonly unknown[] | undefined;
  };

  useEffect(() => {
      if(Number(lastSelectedUniswapTokenId) > 0) {
        queryClient.invalidateQueries({ queryKey: lastSelectedUniswapTokenPositionDetailsQueryKey })
      }
  }, [blockNumber, queryClient, lastSelectedUniswapTokenId, lastSelectedUniswapTokenPositionDetailsQueryKey]);

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
    data: stakingContractStakingPowerAllowance,
    queryKey: stakingContractStakingPowerAllowanceQueryKey
  } = useReadContract({
    address: STAKING_V3_CONTRACT_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address, STAKING_V3_CONTRACT_ADDRESS],
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
    data: sharesIssuedAgainstSelectionLP,
    queryKey: sharesIssuedAgainstSelectionLPQueryKey,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'tokenAddressToStakedTokenIdToSharesIssued',
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakerUnlockTimeLP,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerModuleUnlockTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_LP_MODULE_ID,
  );

  // const { 
  //   data: moduleLockedAtTime,
  //   // isLoading: isLoadingModuleUnlockTime,
  // } = useStakerModuleLockedAtTime(
  //   STAKING_V3_CORE_CONTRACT_ADDRESS,
  //   address,
  //   chain ? chain.id : undefined,
  //   STAKING_V3_LP_MODULE_ID,
  // );

  const {
    data: stakerToModuleIdToCumulativeRewardsPerShareLP,
    queryKey: stakerToModuleIdToCumulativeRewardsPerShareLPQueryKey,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'stakerToModuleIdToCumulativeRewardsPerShare',
    args: [address, STAKING_V3_LP_MODULE_ID],
  });
  
  const {
    data: cumulativeRewardsPerShare,
    queryKey: cumulativeRewardsPerShareQueryKey,
  } = useReadContract({
    address: STAKING_V3_CORE_CONTRACT_ADDRESS,
    abi: PRONFTStakingV3CoreABI,
    functionName: 'cumulativeRewardsPerShare',
    args: [],
  });

  const { 
      data: stakerRewardOnModule,
      // isLoading: isLoadingStakerRewardOnModule,
  } = useApproxStakerRewardsPendingByModuleV3(
    STAKING_V3_LP_MODULE_ID,
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined
  )

  useEffect(() => {

    const queryKeys = [
      stakingContractStakingPowerAllowanceQueryKey,
      dataUniswapLPsIsStakingContractApprovedQueryKey,
      balancePStakeQueryKey,
      cumulativeRewardsPerShareQueryKey,
      stakerToModuleIdToCumulativeRewardsPerShareLPQueryKey,
      sharesIssuedAgainstSelectionLPQueryKey,
    ];

    if (queryKeys.every(Boolean)) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [
    blockNumber,
    queryClient,
    stakingContractStakingPowerAllowanceQueryKey,
    dataUniswapLPsIsStakingContractApprovedQueryKey,
    balancePStakeQueryKey,
    cumulativeRewardsPerShareQueryKey,
    stakerToModuleIdToCumulativeRewardsPerShareLPQueryKey,
    sharesIssuedAgainstSelectionLPQueryKey,
  ]);

  // --------------------------------------

  // APPROVE Uniswap LP NFT CALLS BELOW

  const { 
    executeTransaction: executePerformUniswapLPSetApprovalForAllTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformUniswapLPSetApprovalForAllTx,
    isAwaitingTx: isAwaitingPerformUniswapLPSetApprovalForAllTx,
    // isLoading: isLoadingPerformPropyKeysSetApprovalForAllTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_UNISWAP_NFT_ADDRESS,
      abi: PropyNFTABI,
      functionName: 'setApprovalForAll',
      args: [STAKING_V3_LP_MODULE_ADDRESS, true],
    },
    successToastMessage: `Uniswap LP NFT Approval granted to staking contract!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE Uniswap LP NFT CALLS ABOVE

  // --------------------------------------

  // STAKE CALLS BELOW

  const { 
    executeTransaction: executePerformStakeLPTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformStakeLPTx,
    isAwaitingTx: isAwaitingPerformStakeLPTx,
    // isLoading: isLoadingPerformStakeLPTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'enterWithOnlyLP',
      args: [selectedTokenIds, selectedLockupPeriodDays],
    },
    successToastMessage: `Stake success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
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
      // if(error?.cause?.shortMessage.indexOf('NOT_OPEN_SEASON') > -1) {
      //   toast.error(`Entry has closed for the current staking season, please wait for the entry period at the beginning of the next season to enter.`);
      // } else if(error?.cause?.shortMessage.indexOf('UNSTAKE_ALL_BEFORE_ADDING_MORE') > -1) {
      //   toast.error(`You have pending rewards, please unstake all staked tokens to claim all pending rewards before staking more tokens.`);
      // } else if (error?.cause?.shortMessage.indexOf('ONLY_APPROVED_STAKERS') > -1) {
      //   toast.error(`Your wallet address has not been approved to enter the staking protocol, please ensure you have completed the KYC process.`)
      // } else {
      //   toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
      // }
      let errorMessage : string | false = false;
      if (error === 'NotOpenSeason') {
        errorMessage = `Entry has closed for the current staking season, please wait for the entry period at the beginning of the next season to enter.`
      } else if (error === 'NotFullRangePosition') {
        errorMessage = `Only full range position NFTs are eligible (-887200 to 887200)`
      } else if (error === 'StakerNotApproved') {
        errorMessage = `Your wallet address has not been approved to enter the staking protocol, please ensure you have completed the KYC process.`
      } else if (error === 'UNSTAKE_ALL_BEFORE_ADDING_MORE') {
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
    executeTransaction: executePerformUnstakeLPTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformUnstakeLPTx,
    isAwaitingTx: isAwaitingPerformUnstakeLPTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'leaveWithOnlyLP',
      args: [selectedTokenIds],
    },
    successToastMessage: `Unstake LP success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
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
    executeTransaction: executePerformEarlyUnstakeLPTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformEarlyUnstakeLPTx,
    isAwaitingTx: isAwaitingPerformEarlyUnstakeLPTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'earlyLeaveWithOnlyLP',
      args: [selectedTokenIds],
    },
    successToastMessage: `Early unstake LP NFT success!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
    onSuccess: () => {
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync('PRONFTStakingV3_LP');
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
  }, [selectedTokenIds, selectedTokenAddress])
  
  useEffect(() => {
    let latestActiveStep : 0|1|2 = getActiveStep(
      mode,
      selectedTokenAddress,
      Boolean(dataUniswapLPsIsStakingContractApproved),
      `${stakingContractStakingPowerAllowance}`,
      selectedLockupPeriodDays,
    );
    setActiveStep(latestActiveStep);
  }, [mode, selectedTokenAddress, dataUniswapLPsIsStakingContractApproved, stakingContractStakingPowerAllowance, selectedLockupPeriodDays])

  const isAwaitingWalletInteraction = useMemo(() => {
    return (
      isAwaitingWalletInteractionPerformStakeLPTx ||
      isAwaitingWalletInteractionPerformUnstakeLPTx ||
      isAwaitingWalletInteractionPerformUniswapLPSetApprovalForAllTx ||
      isAwaitingWalletInteractionPerformEarlyUnstakeLPTx
    );
  }, [
    isAwaitingWalletInteractionPerformStakeLPTx,
    isAwaitingWalletInteractionPerformUniswapLPSetApprovalForAllTx,
    isAwaitingWalletInteractionPerformUnstakeLPTx,
    isAwaitingWalletInteractionPerformEarlyUnstakeLPTx,
  ]);

  const disableSelectionAdjustments = useMemo(() => {
    return (
      isAwaitingWalletInteraction || 
      isAwaitingPerformStakeLPTx || 
      isSyncingStaking
    )
  }, [
    isAwaitingWalletInteraction, 
    isAwaitingPerformStakeLPTx,
    isSyncingStaking
  ])

  const getMaxHelperTextLP = () => {
    let balance =  Number(uniswapLPNFT ? uniswapLPNFT.length : 0);
    let relevantTokenName = "Uniswap LP NFT"
    let actionName = mode === "enter" ? "stake" : "unstake";
    let currentTokenState = mode === "enter" ? "unstaked" : "staked";
    return (
      <>
        Maximum 1 token per transaction, you have <strong>{balance} {currentTokenState} {relevantTokenName}{balance === 1 ? "" : "s"}</strong>, therefore you would need to perform <strong>{Math.ceil(balance / maxSelectionLP)} separate {actionName} transactions</strong> to {actionName} all of your {currentTokenState} tokens
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
        {selectedStakingModule === "lp" &&
          <>
            {((!isDeprecatedStakingVersion) || (mode === "leave")) &&
              <>
                <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {!(isLoading || isLoadingGeoLocation) && (uniswapLPNFT && uniswapLPNFT.length > 0) &&
                    <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                      <Typography variant="body1" style={{textAlign: 'left'}}>
                        {(uniswapLPNFTPaginationData && uniswapLPNFTPaginationData?.total > 0) &&
                          <>
                            {`Found ${uniswapLPNFTPaginationData && uniswapLPNFTPaginationData?.total > 0 ? uniswapLPNFTPaginationData.total : 0} Uniswap LP NFTs`}<br/>
                          </>
                        }
                        Please click on the token(s) that you would like to {mode === "enter" ? "stake" : "unstake"}
                      </Typography>
                    </Grid>
                  }
                  {!(isLoading || isLoadingGeoLocation) && uniswapLPNFT && uniswapLPNFT.map((balanceRecord, index) => (
                    <Grid key={`${uniqueId}-single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCard imageObjectFit={'contain'} imageHeight={"300px"} cardHeight={"398px"} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelectedSingle} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
                    </Grid>  
                  ))}
                  {(isLoading || isLoadingGeoLocation) && 
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
                    (mode === "enter") && ((uniswapLPNFT && uniswapLPNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count)))}
                          onClick={() => setMaxUnstakedLoadCount(maxUnstakedLoadCount + 100)}
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
                          text={(
                            (uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {
                    (mode === "leave") && ((uniswapLPNFT && uniswapLPNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count)))}
                          onClick={() => setMaxStakedLoadCount(maxStakedLoadCount + 100)}
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
                          text={(
                            (uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {!(isLoading || isLoadingGeoLocation) && (uniswapLPNFT && uniswapLPNFT.length === 0) &&
                    <Grid key={`${uniqueId}-single-token-card-loading-unfound`} item xs={4} sm={8} md={12} lg={20} xl={30}>
                      <Typography variant="h6" style={{textAlign: 'left'}}>
                          {mode === "enter" ? "No unstaked tokens found" : "No staked tokens found"}
                      </Typography>
                    </Grid>
                  }
                </Grid>
                <animated.div className={classes.floatingActionZone} style={actionZoneSpring}>
                  <Card className={classes.floatingActionZoneCard} elevation={6}>
                      <Typography variant="h6">
                        {mode === "enter" ? "Stake " : "Unstake "}{selectedTokenIds.length} Uniswap LP NFT{selectedTokenIds.length === 1 ? "" : "s"}
                      </Typography>
                      <Typography variant="caption" style={{lineHeight: 1.6}}>
                        {getMaxHelperTextLP()}
                      </Typography>
                      {mode === "enter" &&
                        <>
                          <Box className={classes.stepContainer}>
                            <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                              {/* TODO feed getActiveStep the proper allowance required param */}
                              <Stepper activeStep={activeStep} alternativeLabel>
                                <Step key={`${uniqueId}-Approve NFT`}>
                                  <StepLabel>{"Approve NFT"}</StepLabel>
                                </Step>
                                <Step key={`${uniqueId}-Select LP Lockup`}>
                                  <StepLabel>{"Select Lockup"}</StepLabel>
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
                          {
                            (
                              ((selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS))
                              && (activeStep === 1 || activeStep === 2)
                            ) &&
                            <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                              <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2">LP Token Details:</Typography>
                              <Typography className={[classes.buttonTitleSmallSpacing, 'flex-center'].join(" ")} variant="subtitle2">
                                Full Range: {(lastSelectedUniswapTokenPositionDetails && (lastSelectedUniswapTokenPositionDetails[1] === 887200 && lastSelectedUniswapTokenPositionDetails[2] === -887200)) ? "Yes" : "No"}
                                <Tooltip placement="top" title={`Only full range positions are supported for staking`}>
                                  <HelpIcon className={'tooltip-helper-icon'} />
                                </Tooltip>
                              </Typography>
                              <Typography className={[classes.buttonTitle, 'flex-center'].join(" ")} variant="subtitle2">
                                Position Value: {priceFormat(Number(utils.formatUnits(Number(lastSelectedUniswapTokenPositionDetails ? lastSelectedUniswapTokenPositionDetails[5] : 0), 8)), 2, 'PRO', false, true)} 
                                <Tooltip placement="top" title={`(${priceFormat(Number(utils.formatUnits(lastSelectedUniswapTokenPositionDetails ? lastSelectedUniswapTokenPositionDetails[3] : 0, 8)), 2, 'PRO', false, true)} + ${priceFormat(Number(utils.formatUnits(lastSelectedUniswapTokenPositionDetails ? lastSelectedUniswapTokenPositionDetails[4] : 0, 18)), 2, 'ETH', false, true)})`}>
                                  <HelpIcon className={'tooltip-helper-icon'} />
                                </Tooltip>
                              </Typography>
                            </div>
                          }
                          {(selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS) && (activeStep === 1 || activeStep === 2) &&
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
                            </div>
                          }
                          <div className={classes.submitButtonContainer}>
                            {
                              (
                                selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS
                                && activeStep === 0
                              ) &&
                              <FloatingActionButton
                                className={classes.submitButton}
                                buttonColor="secondary"
                                disabled={isAwaitingPerformUniswapLPSetApprovalForAllTx || isAwaitingWalletInteraction}
                                onClick={() => executePerformUniswapLPSetApprovalForAllTx()}
                                showLoadingIcon={isAwaitingPerformUniswapLPSetApprovalForAllTx || isAwaitingWalletInteraction}
                                text={getApproveNFTButtonText(isAwaitingWalletInteraction, isAwaitingPerformUniswapLPSetApprovalForAllTx)}
                              />
                            }
                            {
                              (
                                ((selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS))
                                && activeStep === 2
                              ) &&
                              <div style={{maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingWalletInteraction || isAwaitingPerformStakeLPTx || isSyncingStaking || !lastSelectedUniswapTokenPositionDetails || Boolean(getLpPositionDetailsError(lastSelectedUniswapTokenPositionDetails))}
                                  onClick={() => {executePerformStakeLPTx();setLastErrorMessage(false)}}
                                  showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformStakeLPTx || isSyncingStaking}
                                  text={getStakeButtonTextLP(isAwaitingWalletInteraction, isAwaitingPerformStakeLPTx, isSyncingStaking, lastSelectedUniswapTokenPositionDetails)}
                                />
                                {selectedLockupPeriodDays > 0 && <Typography className={classes.buttonSubtitle} variant="subtitle2">Staking causes a <strong>{selectedLockupPeriodDays}-day lockup</strong> period on all staked tokens, including tokens that are already staked. <strong>The only way to unstake during an active lockup period would be to forfeit all rewards associated with your stake</strong>.</Typography>}
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
                                  pSTAKE Burn: {priceFormat(Number(utils.formatUnits(Number(sharesIssuedAgainstSelectionLP ? sharesIssuedAgainstSelectionLP : 0), 8)), 2, 'pSTAKE', false, true)} 
                                  <Tooltip placement="top" title={`Unstaking would burn ${priceFormat(Number(utils.formatUnits(Number(sharesIssuedAgainstSelectionLP ? sharesIssuedAgainstSelectionLP : 0), 8)), 2, 'pSTAKE', false, true)} from your total pSTAKE balance (${priceFormat(Number(utils.formatUnits(Number(balancePStake ? balancePStake : 0), 8)), 2, 'pSTAKE', false, true)}) to withdraw your original LP token along with any pending rewards.`}>
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
                                {(Number(stakerUnlockTimeLP) * 1000 < new Date().getTime()) &&
                                  <FloatingActionButton
                                    className={classes.submitButton}
                                    buttonColor="secondary"
                                    disabled={isAwaitingPerformUnstakeLPTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimeLP) * 1000 > new Date().getTime()) || isSyncingStaking}
                                    onClick={() => executePerformUnstakeLPTx()}
                                    showLoadingIcon={isAwaitingPerformUnstakeLPTx || isAwaitingWalletInteraction || isSyncingStaking}
                                    text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformUnstakeLPTx, isSyncingStaking)}
                                  />
                                }
                                {(Number(stakerUnlockTimeLP) * 1000 > new Date().getTime()) &&
                                  <>
                                    <Typography className={classes.buttonSubtitleBottomSpacer} variant="subtitle2"><strong>Locked for {countdownToTimestamp(Number(stakerUnlockTimeLP), "")}</strong></Typography>
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
                                      disabled={isAwaitingPerformEarlyUnstakeLPTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimeLP) * 1000 < new Date().getTime()) || isSyncingStaking || !acceptsEarlyUnstake}
                                      onClick={() => executePerformEarlyUnstakeLPTx()}
                                      showLoadingIcon={isAwaitingPerformUnstakeLPTx || isAwaitingWalletInteraction || isSyncingStaking}
                                      text={getEarlyUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformEarlyUnstakeLPTx, isSyncingStaking)}
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

export default StakePortalV3LPModule;