import React, { useState, useEffect } from 'react';

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

import { useAccount, useNetwork, useBalance, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';


import { PropsFromRedux } from '../containers/StakeStatsContainer';

import SingleTokenCard from './SingleTokenCard';
// import SingleTokenCardLoading from './SingleTokenCardLoading';

import FloatingActionButton from './FloatingActionButton';

import {
  priceFormat,
  countdownToTimestamp,
} from '../utils';

import {
  BASE_PROPYKEYS_STAKING_CONTRACT,
  BASE_PROPYKEYS_STAKING_NFT,
  BASE_OG_STAKING_NFT,
  PRO_BASE_L2_ADDRESS,
} from '../utils/constants';

import {
  IAssetRecord,
  IBalanceRecord,
} from '../interfaces';

import ERC20ABI from '../abi/ERC20ABI.json';
import PropyNFTABI from '../abi/PropyNFTABI.json';
import PRONFTStakingABI from '../abi/PRONFTStakingABI.json';

import {
  AccountBalanceService,
  StakeService,
} from '../services/api';

import { useStakerUnlockTime } from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
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
    },
    floatingActionZone: {
      position: 'fixed',
      maxWidth: '400px',
      width: 'calc(100% - 16px)',
      transform: 'translateY(0%)',
      textAlign: 'center',
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
    buttonTitle: {
      marginBottom: theme.spacing(1),
    },
    buttonTitleSmallSpacing: {
      marginBottom: theme.spacing(0.5),
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

const getApprovePROButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingPROAllowanceTx: boolean,
) => {
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingPROAllowanceTx) {
    return "Granting Allowance...";
  }

  return "Grant PRO Allowance";
}

const getApprovePStakeButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingPStakeAllowanceTx: boolean,
) => {
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingPStakeAllowanceTx) {
    return "Granting Allowance...";
  }

  return "Grant pSTAKE Allowance";
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
  
  return "Stake";
}

const getActiveStep = (
  mode: string,
  selectedTokenAddress: string | false,
  isPropyKeysStakingContractApproved: boolean,
  isPropyOGsStakingContractApproved: boolean,
  currentStakingContractAllowance: string,
  requiredPROAllowance: string,
  stakingPowerToUnstake: string,
  stakingContractStakingPowerAllowance: string,
) => {
  // todo
  // use currentStakingContractAllowance & requiredAllowance
  if(mode === "enter") {
    let isSufficientAllowancePRO = new BigNumber(currentStakingContractAllowance).isGreaterThanOrEqualTo(requiredPROAllowance);
    if(selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT) {
      console.log({isSufficientAllowancePRO, requiredPROAllowance, currentStakingContractAllowance})
      if (!isPropyKeysStakingContractApproved) {
        return 0;
      } else if (isPropyKeysStakingContractApproved && !isSufficientAllowancePRO) {
        return 1;
      } else if(isPropyKeysStakingContractApproved && isSufficientAllowancePRO) {
        return 2;
      } 
    } else if(selectedTokenAddress === BASE_OG_STAKING_NFT) {
      if (!isPropyOGsStakingContractApproved) {
        return 0;
      } else if (isPropyOGsStakingContractApproved && !isSufficientAllowancePRO) {
        return 1;
      } else if(isPropyOGsStakingContractApproved && isSufficientAllowancePRO) {
        return 2;
      }
    }
  } else if (mode === "leave") {
    let isSufficientAllowanceStakingPower = new BigNumber(stakingContractStakingPowerAllowance).isGreaterThanOrEqualTo(stakingPowerToUnstake);
    if(!isSufficientAllowanceStakingPower) {
      return 0;
    } else {
      return 1;
    }
  }
  return 0;
}

const StakeEnter = (props: PropsFromRedux & IStakeEnter) => {

  const {
    mode,
    postStakeSuccess,
  } = props;

  const classes = useStyles();

  const { chain } = useNetwork();

  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [propyKeysNFT, setPropyKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [ogKeysNFT, setOGKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [selectedTokenIds, setSelectedPropyKeyTokenIds] = useState<number[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<false | string>(false);
  const [isAwaitingUnstakeTx, setIsAwaitingUnstakeTx] = useState(false);
  const [isAwaitingPropyKeysApprovalForAllTx, setIsAwaitingPropyKeysApprovalForAllTx] = useState(false);
  const [isAwaitingOGApprovalForAllTx, setIsAwaitingOGApprovalForAllTx] = useState(false);
  const [isAwaitingPROAllowanceTx, setIsAwaitingPROAllowanceTx] = useState(false);
  const [isAwaitingPStakeAllowanceTx, setIsAwaitingPStakeAllowanceTx] = useState(false);
  const [isAwaitingStakeTx, setIsAwaitingStakeTx] = useState(false);
  const [isAwaitingWalletInteraction, setIsAwaitingWalletInteraction] = useState(false);
  const [activeStep, setActiveStep] = useState<0|1|2>(0);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);
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
    setSelectedPropyKeyTokenIds([]);
    setSelectedTokenAddress(false);
  }, [address])

  useEffect(() => {
    setSelectedPropyKeyTokenIds([]);
    setSelectedTokenAddress(false);
  }, [triggerUpdateIndex])

  useEffect(() => {
    let isMounted = true;
    const getStakingTokens = async () => {
      if(address) {
        let results;
        if (mode === "enter") {
          results = await Promise.all([
            AccountBalanceService.getAccountBalancesByAssetIncludeStakingStatus(address, BASE_PROPYKEYS_STAKING_NFT),
            AccountBalanceService.getAccountBalancesByAssetIncludeStakingStatus(address, BASE_OG_STAKING_NFT),
          ])
        } else if(mode === "leave") {
          results = await Promise.all([
            AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, BASE_PROPYKEYS_STAKING_NFT),
            AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, BASE_OG_STAKING_NFT),
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
            setOGKeysNFT(ogRenderResults);
          }
        }
      }
    }
    getStakingTokens();
    return () => {
      isMounted = false;
    }
  }, [address, mode, triggerUpdateIndex])

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
      setSelectedPropyKeyTokenIds(newSelection);
    } else {
      let newSelection = [...useCurrentSelection, Number(balanceRecord.token_id)];
      if(newSelection?.length > 0) {
        setSelectedTokenAddress(balanceRecord.asset_address);
      } else {
        setSelectedTokenAddress(false);
      }
      setSelectedPropyKeyTokenIds(newSelection);
    }
  };

  const selectAllOfCurrentCollection = () => {
    let maxSelection = 100;
    console.log({selectedTokenAddress, BASE_PROPYKEYS_STAKING_NFT, BASE_OG_STAKING_NFT})
    if(selectedTokenAddress) {
      if(selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT) {
        let newSelection = (propyKeysNFT && (propyKeysNFT?.length > 0)) ? propyKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        setSelectedPropyKeyTokenIds(newSelection);
      }
      if(selectedTokenAddress === BASE_OG_STAKING_NFT) {
        let newSelection = (ogKeysNFT && (ogKeysNFT?.length > 0)) ? ogKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        console.log({newSelection})
        setSelectedPropyKeyTokenIds(newSelection);
      }
    }
  }

  const deselectAllOfCurrentCollection = () => {
    setSelectedPropyKeyTokenIds([]);
    setSelectedTokenAddress(false);
  }
  
  console.log({propyKeysNFT, nftAssets, selectedTokenIds})

  const { 
    data: dataPropyKeysIsStakingContractApproved,
  } = useContractRead({
    address: BASE_PROPYKEYS_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    watch: true,
    args: [address, BASE_PROPYKEYS_STAKING_CONTRACT],
  })

  const { 
    data: dataPropyOGsIsStakingContractApproved,
  } = useContractRead({
    address: BASE_OG_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    watch: true,
    args: [address, BASE_PROPYKEYS_STAKING_CONTRACT],
  });

  const { 
    data: stakingContractPROAllowance,
  } = useContractRead({
    address: PRO_BASE_L2_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    watch: true,
    args: [address, BASE_PROPYKEYS_STAKING_CONTRACT],
  });

  const { 
    data: minimumRequiredPROAllowance,
    isLoading: isLoadingMinimumRequiredPROAllowance,
  } = useContractRead({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: PRONFTStakingABI,
    functionName: 'getPROAmountToStake',
    watch: true,
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakingContractStakingPowerAllowance,
  } = useContractRead({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: ERC20ABI,
    functionName: 'allowance',
    watch: true,
    args: [address, BASE_PROPYKEYS_STAKING_CONTRACT],
  });

  const { 
    data: sharesIssuedAgainstSelection,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useContractRead({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: PRONFTStakingABI,
    functionName: 'getSharesIssued',
    watch: true,
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakerUnlockTime,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerUnlockTime(
    BASE_PROPYKEYS_STAKING_CONTRACT,
    address,
    chain ? chain.id : undefined
  );

  const {
    data: balanceDataPRO,
  } = useBalance({
    address: address,
    token: PRO_BASE_L2_ADDRESS,
    watch: true,
  });

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    data: dataPerformPROAllowance,
    writeAsync: writePerformPROAllowance
  } = useContractWrite({
    address: PRO_BASE_L2_ADDRESS,
    abi: ERC20ABI,
    functionName: 'approve',
    args: [BASE_PROPYKEYS_STAKING_CONTRACT, minimumRequiredPROAllowance],
    onError(error: any) {
      setIsAwaitingPROAllowanceTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformPROAllowance?.hash,
    onSettled() {
      setIsAwaitingPROAllowanceTx(false);
    },
    onSuccess() {
      toast.success(`Granted PRO Allowance!`);
    },
  })

  const runAllowancePRO = async () => {
    try {
      setIsAwaitingPROAllowanceTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPROAllowance();
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE PRO ON CHAIN CALLS ABOVE

  // --------------------------------------

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    data: dataPerformPStakeAllowance,
    writeAsync: writePerformPStakeAllowance
  } = useContractWrite({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: ERC20ABI,
    functionName: 'approve',
    args: [BASE_PROPYKEYS_STAKING_CONTRACT, sharesIssuedAgainstSelection],
    onError(error: any) {
      setIsAwaitingPStakeAllowanceTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformPStakeAllowance?.hash,
    onSettled() {
      setIsAwaitingPStakeAllowanceTx(false);
    },
    onSuccess() {
      toast.success(`Granted PRO Allowance!`);
    },
  })

  const runAllowancePStake = async () => {
    try {
      setIsAwaitingPStakeAllowanceTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPStakeAllowance();
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE pSTAKE ON CHAIN CALLS ABOVE

  // --------------------------------------

  // APPROVE PROPYKEYS NFT CALLS BELOW

  const { 
    data: dataPerformPropyKeysNFTSetApprovalForAll,
    writeAsync: writePerformPropyKeysSetApprovalForAll
  } = useContractWrite({
    address: BASE_PROPYKEYS_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'setApprovalForAll',
    args: [BASE_PROPYKEYS_STAKING_CONTRACT, true],
    onError(error: any) {
      setIsAwaitingPropyKeysApprovalForAllTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformPropyKeysNFTSetApprovalForAll?.hash,
    onSettled() {
      setIsAwaitingPropyKeysApprovalForAllTx(false);
    },
    onSuccess() {
      toast.success(`PropyKeys NFT Approval granted to staking contract!`);
    },
  })

  const runPropyKeysSetApprovalForAll = async () => {
    try {
      setIsAwaitingPropyKeysApprovalForAllTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPropyKeysSetApprovalForAll();
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE PROPYKEYS NFT CALLS ABOVE

  // --------------------------------------

  // APPROVE OG NFT CALLS BELOW

  const { 
    data: dataPerformOGSetApprovalForAll,
    writeAsync: writePerformOGSetApprovalForAll
  } = useContractWrite({
    address: BASE_OG_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'setApprovalForAll',
    args: [BASE_PROPYKEYS_STAKING_CONTRACT, true],
    onError(error: any) {
      setIsAwaitingOGApprovalForAllTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformOGSetApprovalForAll?.hash,
    onSettled() {
      setIsAwaitingOGApprovalForAllTx(false);
    },
    onSuccess() {
      toast.success(`PropyKeys NFT Approval granted to staking contract!`);
    },
  })

  const runOGSetApprovalForAll = async () => {
    try {
      setIsAwaitingOGApprovalForAllTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformOGSetApprovalForAll();
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE OG NFT CALLS ABOVE

  // --------------------------------------

  // STAKE CALLS BELOW

  const { 
    data: dataPerformStake,
    writeAsync: writePerformStake
  } = useContractWrite({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: PRONFTStakingABI,
    functionName: 'enter',
    args: [selectedTokenAddress, selectedTokenIds],
    onError(error: any) {
      setIsAwaitingStakeTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformStake?.hash,
    onSettled() {
      setIsAwaitingStakeTx(false);
    },
    onSuccess() {
      toast.success(`Stake success!`);
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        await StakeService.triggerStakeOptimisticSync();
        setTriggerUpdateIndex(triggerUpdateIndex + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false);
      }
      syncStaking();
    },
  })

  const runStake = async () => {
    try {
      setIsAwaitingStakeTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformStake();
    } catch(e: any) {
      console.log({e});
    }
  }

  // STAKE CALLS ABOVE

  // --------------------------------------

  // UNSTAKING ON CHAIN CALLS BELOW

  const { 
    data: dataPerformUnstake,
    writeAsync: writePerformUnstake
  } = useContractWrite({
    address: BASE_PROPYKEYS_STAKING_CONTRACT,
    abi: PRONFTStakingABI,
    functionName: 'leave',
    args: [selectedTokenAddress, selectedTokenIds],
    onError(error: any) {
      setIsAwaitingUnstakeTx(false);
      toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
    },
    onSettled() {
      setIsAwaitingWalletInteraction(false);
    },
  });

  useWaitForTransaction({
    hash: dataPerformUnstake?.hash,
    onSettled() {
      setIsAwaitingUnstakeTx(false);
    },
    onSuccess() {
      toast.success(`Unstake success!`);
      const syncStaking = async () => {
        setIsSyncingStaking(true)
        await StakeService.triggerStakeOptimisticSync();
        setTriggerUpdateIndex(triggerUpdateIndex + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false)
      }
      syncStaking();
    },
  })

  const runUnstake = async () => {
    try {
      setIsAwaitingUnstakeTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformUnstake();
    } catch(e: any) {
      console.log({e});
    }
  }

  // UNSTAKING ON CHAIN CALLS ABOVE

  // --------------------------------------
  
  useEffect(() => {
    // todo use actual PRO required
    let latestActiveStep : 0|1|2 = getActiveStep(
      mode,
      selectedTokenAddress,
      Boolean(dataPropyKeysIsStakingContractApproved),
      Boolean(dataPropyOGsIsStakingContractApproved),
      `${stakingContractPROAllowance}`,
      `${minimumRequiredPROAllowance}`,
      `${sharesIssuedAgainstSelection}`,
      `${stakingContractStakingPowerAllowance}`,
    );
    setActiveStep(latestActiveStep);
  }, [mode, selectedTokenAddress, dataPropyKeysIsStakingContractApproved, dataPropyOGsIsStakingContractApproved, stakingContractPROAllowance, minimumRequiredPROAllowance, sharesIssuedAgainstSelection, stakingContractStakingPowerAllowance])

  let disableSelectionAdjustments = isAwaitingPropyKeysApprovalForAllTx || isAwaitingWalletInteraction || isAwaitingOGApprovalForAllTx || isAwaitingPROAllowanceTx || isAwaitingStakeTx || isAwaitingPStakeAllowanceTx || isAwaitingUnstakeTx || isSyncingStaking;

  return (
    <div className={classes.root}>
      <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
        {propyKeysNFT && propyKeysNFT.map((balanceRecord, index) => (
          <Grid key={`single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard disabled={(selectedTokenAddress === BASE_OG_STAKING_NFT)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
          </Grid>  
        ))}
        {ogKeysNFT && ogKeysNFT.map((balanceRecord, index) => (
          <Grid key={`single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
            <SingleTokenCard disabled={(selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === BASE_OG_STAKING_NFT)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
          </Grid>  
        ))}
      </Grid>
      <animated.div className={classes.floatingActionZone} style={actionZoneSpring}>
        <Card className={classes.floatingActionZoneCard} elevation={6}>
            <Typography variant="h6">
              {mode === "enter" ? "Stake " : "Unstake "}{selectedTokenIds.length}{selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT ? " PropyKey" : " PropyOG"}{selectedTokenIds.length === 1 ? "" : "s"}
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
                  <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
                    {/* TODO feed getActiveStep the proper allowance required param */}
                    <Stepper activeStep={activeStep} alternativeLabel>
                      <Step key={"Approve NFT"}>
                        <StepLabel>{"Approve NFT"}</StepLabel>
                      </Step>
                      <Step key={"Approve PRO"}>
                        <StepLabel>{"Approve PRO"}</StepLabel>
                      </Step>
                      <Step key={"Enter Staking"}>
                        <StepLabel>{"Enter Staking"}</StepLabel>
                      </Step>
                    </Stepper>
                  </div>
                </Box>
                <div className={classes.submitButtonContainer}>
                  {
                    (
                      selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT
                      && activeStep === 0
                    ) &&
                    <FloatingActionButton
                      className={classes.submitButton}
                      buttonColor="secondary"
                      disabled={isAwaitingPropyKeysApprovalForAllTx || isAwaitingWalletInteraction}
                      onClick={() => runPropyKeysSetApprovalForAll()}
                      showLoadingIcon={isAwaitingPropyKeysApprovalForAllTx || isAwaitingWalletInteraction}
                      text={getApproveNFTButtonText(isAwaitingWalletInteraction, isAwaitingPropyKeysApprovalForAllTx)}
                    />
                  }
                  {
                    (
                      (selectedTokenAddress === BASE_OG_STAKING_NFT)
                      && activeStep === 0
                    ) &&
                    <FloatingActionButton
                      className={classes.submitButton}
                      buttonColor="secondary"
                      disabled={isAwaitingOGApprovalForAllTx || isAwaitingWalletInteraction}
                      onClick={() => runOGSetApprovalForAll()}
                      showLoadingIcon={isAwaitingOGApprovalForAllTx || isAwaitingWalletInteraction}
                      text={getApproveNFTButtonText(isAwaitingWalletInteraction, isAwaitingOGApprovalForAllTx)}
                    />
                  }
                  {
                    (
                      ((selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT) || (selectedTokenAddress === BASE_OG_STAKING_NFT))
                      && activeStep === 1
                    ) &&
                    <FloatingActionButton
                      className={classes.submitButton}
                      buttonColor="secondary"
                      disabled={isLoadingMinimumRequiredPROAllowance || isAwaitingWalletInteraction || isAwaitingPROAllowanceTx || !minimumRequiredPROAllowance || isNaN(Number(stakingContractPROAllowance))}
                      onClick={() => runAllowancePRO()}
                      showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPROAllowanceTx}
                      text={getApprovePROButtonText(isAwaitingWalletInteraction, isAwaitingPROAllowanceTx)}
                    />
                  }
                  {
                    (
                      ((selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT) || (selectedTokenAddress === BASE_OG_STAKING_NFT))
                      && activeStep === 2
                    ) &&
                    <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
                      <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2">PRO Balance: {priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value : 0), 8)), 2, 'PRO', false, true)}</Typography>
                      <Typography className={classes.buttonTitle} variant="subtitle2">{priceFormat(Number(utils.formatUnits(Number(minimumRequiredPROAllowance ? minimumRequiredPROAllowance : 0), 8)), 2, 'PRO', false, true)} Required</Typography>
                      <FloatingActionButton
                        className={classes.submitButton}
                        buttonColor="secondary"
                        disabled={isAwaitingWalletInteraction || isAwaitingStakeTx || isSyncingStaking || new BigNumber(balanceDataPRO?.value ? balanceDataPRO?.value.toString() : 0).isLessThanOrEqualTo(minimumRequiredPROAllowance ? minimumRequiredPROAllowance.toString() : 0)}
                        onClick={() => runStake()}
                        showLoadingIcon={isAwaitingWalletInteraction || isAwaitingStakeTx || isSyncingStaking}
                        text={getStakeButtonText(isAwaitingWalletInteraction, isAwaitingStakeTx, isSyncingStaking)}
                      />
                      <Typography className={classes.buttonSubtitle} variant="subtitle2">Staking causes a 3-day lockup period on all staked tokens, including tokens that are already staked. You cannot unstake any tokens during the lockup period.</Typography>
                    </div>
                  }
                </div>
              </>
            }
            {mode === "leave" &&
              <>
                <Box className={classes.stepContainer}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    <Step key={"Approve pSTAKE"}>
                      <StepLabel>{"Approve pSTAKE"}</StepLabel>
                    </Step>
                    <Step key={"Unstake"}>
                      <StepLabel>{"Unstake"}</StepLabel>
                    </Step>
                  </Stepper>
                </Box>
                <div className={classes.submitButtonContainer}>
                  {
                    (
                      activeStep === 0
                    ) &&
                    <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                      <FloatingActionButton
                        className={classes.submitButton}
                        buttonColor="secondary"
                        disabled={isAwaitingPStakeAllowanceTx || isAwaitingWalletInteraction}
                        onClick={() => runAllowancePStake()}
                        showLoadingIcon={isAwaitingPStakeAllowanceTx || isAwaitingWalletInteraction}
                        text={getApprovePStakeButtonText(isAwaitingWalletInteraction, isAwaitingPStakeAllowanceTx)}
                      />
                    </div>
                  }
                  {
                    (
                      activeStep === 1
                    ) &&
                    <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                      <FloatingActionButton
                        className={classes.submitButton}
                        buttonColor="secondary"
                        disabled={isAwaitingUnstakeTx || isAwaitingWalletInteraction || (Number(stakerUnlockTime) * 1000 > new Date().getTime()) || isSyncingStaking}
                        onClick={() => runUnstake()}
                        showLoadingIcon={isAwaitingUnstakeTx || isAwaitingWalletInteraction || isSyncingStaking}
                        text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingUnstakeTx, isSyncingStaking)}
                      />
                      {(Number(stakerUnlockTime) * 1000 > new Date().getTime()) &&
                        <Typography className={classes.buttonSubtitle} variant="subtitle2">Locked for {countdownToTimestamp(Number(stakerUnlockTime), "")}</Typography>
                      }
                    </div>
                  }
                </div>
              </>
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
                  <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
                    <FloatingActionButton
                      className={classes.submitButton}
                      buttonColor="secondary"
                      disabled={true}
                      // onClick={() => runStake()}
                      showLoadingIcon={true}
                      text={'Syncing Staking Contract...'}
                    />
                  </div>
              </div>
            </>
        </Card>
      </animated.div>
    </div>
  );
}

export default StakeEnter;