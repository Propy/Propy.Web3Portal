import React, { useState, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query'

import { animated, useSpring } from '@react-spring/web';

import { useQuery } from '@tanstack/react-query';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';

import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';

import { PropsFromRedux } from '../containers/StakeStatsContainer';

import SingleTokenCard from './SingleTokenCard';
import SingleTokenCardLoading from './SingleTokenCardLoading';

import FloatingActionButton from './FloatingActionButton';

import LinkWrapper from './LinkWrapper';

import {
  priceFormat,
  countdownToTimestamp,
  sleep,
} from '../utils';

import {
  BASE_PROPYKEYS_STAKING_CONTRACT_V1,
  BASE_PROPYKEYS_STAKING_CONTRACT_V2,
  BASE_PROPYKEYS_STAKING_NFT,
  BASE_OG_STAKING_NFT,
  PRO_BASE_L2_ADDRESS,
  STAKING_ORIGIN_COUNTRY_BLACKLIST,
  PROPY_LIGHT_BLUE,
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
  GeoService,
} from '../services/api';

import { useStakerUnlockTime } from '../hooks';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
  version: number
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      lineHeight: 0,
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
    loadingZone: {
      opacity: 0.5,
    }
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
    version,
  } = props;

  const classes = useStyles();

  const latestStakingVersion = 2;

  const maxSelection = 100;

  let isDeprecatedStakingVersion = version < latestStakingVersion;

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { chain } = useAccount();

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
  const [isLoading, setIsLoading] = useState(true);
  const [showRequireTenModal, setShowRequireTenModal] = useState(false);
  const [isSyncingStaking, setIsSyncingStaking] = useState(false);
  const [lastSelectedPropyKeyTokenId, setLastSelectedPropyKeyTokenId] = useState(0);
  const [isBlacklistedOrigin, setIsBlacklistedOrigin] = useState(false);

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
    setIsLoading(true);
  }, [version])

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
            AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, BASE_PROPYKEYS_STAKING_NFT, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2),
            AccountBalanceService.getAccountBalancesByAssetOnlyStaked(address, BASE_OG_STAKING_NFT, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2),
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
            setIsLoading(false);
          }
        }
      }
    }
    getStakingTokens();
    return () => {
      isMounted = false;
    }
  }, [address, mode, triggerUpdateIndex, version])

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
      if(balanceRecord?.nft?.asset_address === BASE_PROPYKEYS_STAKING_NFT) {
        setLastSelectedPropyKeyTokenId(Number(balanceRecord.nft.token_id));
      } else {
        setLastSelectedPropyKeyTokenId(0);
      }
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
    console.log({selectedTokenAddress, BASE_PROPYKEYS_STAKING_NFT, BASE_OG_STAKING_NFT})
    if(selectedTokenAddress) {
      if(selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT) {
        let newSelection = (propyKeysNFT && (propyKeysNFT?.length > 0)) ? propyKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        setSelectedPropyKeyTokenIds(newSelection);
      }
      if(selectedTokenAddress === BASE_OG_STAKING_NFT) {
        let newSelection = (ogKeysNFT && (ogKeysNFT?.length > 0)) ? ogKeysNFT.map((balanceRecord, index) => Number(balanceRecord.token_id)).slice(0, maxSelection) : [];
        setSelectedPropyKeyTokenIds(newSelection);
      }
    }
  }

  const deselectAllOfCurrentCollection = () => {
    setSelectedPropyKeyTokenIds([]);
    setSelectedTokenAddress(false);
  }

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

  useEffect(() => {
    if(STAKING_ORIGIN_COUNTRY_BLACKLIST.indexOf(clientCountry) > -1) {
      setIsBlacklistedOrigin(true);
    } else {
      setIsBlacklistedOrigin(false);
    }
  }, [clientCountry])
  
  console.log({propyKeysNFT, nftAssets, selectedTokenIds, clientCountry})

  const { 
    data: dataPropyKeysIsStakingContractApproved,
    queryKey: dataPropyKeysIsStakingContractApprovedQueryKey
  } = useReadContract({
    address: BASE_PROPYKEYS_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2],
  });

  const { 
    data: lastSelectedTokenTier,
    queryKey: lastSelectedTokenTierQueryKey
  } = useReadContract({
    address: BASE_PROPYKEYS_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'tokenTier',
    args: [lastSelectedPropyKeyTokenId],
  })

  useEffect(() => {
    if(Number(lastSelectedPropyKeyTokenId) > 0) {
      queryClient.invalidateQueries({ queryKey: lastSelectedTokenTierQueryKey })
    }
  }, [blockNumber, queryClient, lastSelectedPropyKeyTokenId, lastSelectedTokenTierQueryKey]);

  const { 
    data: stakerToStakedCount,
    queryKey: stakerToStakedCountQueryKey,
  } = useReadContract({
    address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
    abi: PRONFTStakingABI,
    functionName: 'stakerToStakedTokenCount',
    args: [address],
  });

  const { 
    data: dataPropyOGsIsStakingContractApproved,
    queryKey: dataPropyOGsIsStakingContractApprovedQueryKey,
  } = useReadContract({
    address: BASE_OG_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2],
  });

  const { 
    data: stakingContractPROAllowance,
    queryKey: stakingContractPROAllowanceQueryKey,
  } = useReadContract({
    address: PRO_BASE_L2_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2],
  });

  const { 
    data: minimumRequiredPROAllowance,
    isLoading: isLoadingMinimumRequiredPROAllowance,
    queryKey: minimumRequiredPROAllowanceQueryKey,
  } = useReadContract({
    address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
    abi: PRONFTStakingABI,
    functionName: 'getPROAmountToStake',
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakingContractStakingPowerAllowance,
    queryKey: stakingContractStakingPowerAllowanceQueryKey
  } = useReadContract({
    address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address, version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2],
  });

  const { 
    data: sharesIssuedAgainstSelection,
    queryKey: sharesIssuedAgainstSelectionQueryKey,
    // isLoading: isLoadingSharesIssuedAgainstSelection,
  } = useReadContract({
    address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
    abi: PRONFTStakingABI,
    functionName: 'getSharesIssued',
    args: [selectedTokenAddress, selectedTokenIds],
  });

  const { 
    data: stakerUnlockTime,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerUnlockTime(
    version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
    address,
    chain ? chain.id : undefined
  );

  const {
    data: balanceDataPRO,
    queryKey: balanceDataPROQueryKey
  } = useBalance({
    address: address,
    token: PRO_BASE_L2_ADDRESS,
  });

  const {
    data: balanceDataPropyKeys,
    queryKey: balanceDataPropyKeysQueryKey,
  } = useReadContract({
    address: BASE_PROPYKEYS_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const {
    data: balanceDataPropyOG,
    queryKey: balanceDataPropyOGQueryKey,
  } = useReadContract({
    address: BASE_OG_STAKING_NFT,
    abi: PropyNFTABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {

    const queryKeys = [
      balanceDataPropyOGQueryKey,
      balanceDataPropyKeysQueryKey
    ];

    if(
      address
      && queryKeys.every(Boolean)
    ) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [
    blockNumber,
    queryClient,
    address,
    balanceDataPropyOGQueryKey,
    balanceDataPropyKeysQueryKey,
  ]);

  useEffect(() => {

    const queryKeys = [
      stakerToStakedCountQueryKey,
      dataPropyKeysIsStakingContractApprovedQueryKey,
      balanceDataPROQueryKey,
      sharesIssuedAgainstSelectionQueryKey,
      stakingContractStakingPowerAllowanceQueryKey,
      dataPropyOGsIsStakingContractApprovedQueryKey,
      stakingContractPROAllowanceQueryKey,
      minimumRequiredPROAllowanceQueryKey,
    ];

    if (queryKeys.every(Boolean)) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [
    blockNumber,
    queryClient,
    stakerToStakedCountQueryKey,
    dataPropyKeysIsStakingContractApprovedQueryKey,
    balanceDataPROQueryKey,
    sharesIssuedAgainstSelectionQueryKey,
    stakingContractStakingPowerAllowanceQueryKey,
    dataPropyOGsIsStakingContractApprovedQueryKey,
    stakingContractPROAllowanceQueryKey,
    minimumRequiredPROAllowanceQueryKey,
  ]);

  useEffect(() => {
    let currentTotal = 0;
    if(Number(stakerToStakedCount) > 0) {
      currentTotal += Number(stakerToStakedCount);
    }
    if(Number(balanceDataPropyKeys) > 0) {
      currentTotal += Number(balanceDataPropyKeys);
    }
    if(Number(balanceDataPropyOG) > 0) {
      currentTotal += Number(balanceDataPropyOG);
    }
    if((Number(lastSelectedTokenTier) === 1) && lastSelectedPropyKeyTokenId && (currentTotal < 10) && (mode === "enter")) {
      setShowRequireTenModal(true);
      setLastSelectedPropyKeyTokenId(0);
    } else if(mode === "leave") {
      setShowRequireTenModal(false);
    }
  }, [lastSelectedTokenTier, lastSelectedPropyKeyTokenId, stakerToStakedCount, balanceDataPropyKeys, balanceDataPropyOG, mode])

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    data: dataPerformPROAllowance,
    writeContractAsync: writePerformPROAllowance
  } = useWriteContract();

  let dataPerformPROAllowanceResult = useWaitForTransactionReceipt({
    hash: dataPerformPROAllowance,
    confirmations: 2,
  });

  useEffect(() => {
    if(dataPerformPROAllowanceResult?.status === "success") {
      setIsAwaitingPROAllowanceTx(false);
      toast.success(`Granted PRO Allowance!`);
    }
    if(dataPerformPROAllowanceResult?.status === "error") {
      setIsAwaitingPROAllowanceTx(false);
      toast.error(`${dataPerformPROAllowanceResult.error ? dataPerformPROAllowanceResult.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformPROAllowanceResult?.status, dataPerformPROAllowanceResult.error]);

  const runAllowancePRO = async () => {
    try {
      setIsAwaitingPROAllowanceTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPROAllowance({
        address: PRO_BASE_L2_ADDRESS,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2, minimumRequiredPROAllowance],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          setIsAwaitingPROAllowanceTx(false);
          toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE PRO ON CHAIN CALLS ABOVE

  // --------------------------------------

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    data: dataPerformPStakeAllowance,
    writeContractAsync: writePerformPStakeAllowance
  } = useWriteContract();

  let dataPerformPStakeAllowanceReceipt = useWaitForTransactionReceipt({
    hash: dataPerformPStakeAllowance,
    confirmations: 2,
  });

  useEffect(() => {
    if(dataPerformPStakeAllowanceReceipt?.status === "success") {
      // handle successful block inclusion + no error
      setIsAwaitingPStakeAllowanceTx(false);
      toast.success(`Granted pSTAKE Allowance!`);
    }
    if(dataPerformPStakeAllowanceReceipt?.status === "error") {
      // handle successful block inclusion + error
      setIsAwaitingPStakeAllowanceTx(false);
      toast.error(`${dataPerformPStakeAllowanceReceipt?.error ? dataPerformPStakeAllowanceReceipt?.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformPStakeAllowanceReceipt?.status, dataPerformPStakeAllowanceReceipt?.error]);	

  const runAllowancePStake = async () => {
    try {
      setIsAwaitingPStakeAllowanceTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPStakeAllowance({
        address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2, sharesIssuedAgainstSelection],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          setIsAwaitingPStakeAllowanceTx(false);
          toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE pSTAKE ON CHAIN CALLS ABOVE

  // --------------------------------------

  // APPROVE PROPYKEYS NFT CALLS BELOW

  const { 
    data: dataPerformPropyKeysNFTSetApprovalForAll,
    writeContractAsync: writePerformPropyKeysSetApprovalForAll
  } = useWriteContract();

  let dataPerformPropyKeysNFTSetApprovalForAllReceipt = useWaitForTransactionReceipt({
    hash: dataPerformPropyKeysNFTSetApprovalForAll,
    confirmations: 2,
  });

  useEffect(() => {
    if(dataPerformPropyKeysNFTSetApprovalForAllReceipt?.status === "success") {
      // handle successful block inclusion + no error
      setIsAwaitingPropyKeysApprovalForAllTx(false);
      toast.success(`PropyKeys NFT Approval granted to staking contract!`);
    }
    if(dataPerformPropyKeysNFTSetApprovalForAllReceipt?.status === "error") {
      // handle successful block inclusion + error
      setIsAwaitingPropyKeysApprovalForAllTx(false);
      toast.error(`${dataPerformPropyKeysNFTSetApprovalForAllReceipt?.error ? dataPerformPropyKeysNFTSetApprovalForAllReceipt?.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformPropyKeysNFTSetApprovalForAllReceipt?.status, dataPerformPropyKeysNFTSetApprovalForAllReceipt?.error]);	

  const runPropyKeysSetApprovalForAll = async () => {
    try {
      setIsAwaitingPropyKeysApprovalForAllTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformPropyKeysSetApprovalForAll({
        address: BASE_PROPYKEYS_STAKING_NFT,
        abi: PropyNFTABI,
        functionName: 'setApprovalForAll',
        args: [version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2, true],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          setIsAwaitingPropyKeysApprovalForAllTx(false);
          toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE PROPYKEYS NFT CALLS ABOVE

  // --------------------------------------

  // APPROVE OG NFT CALLS BELOW

  const { 
    data: dataPerformOGSetApprovalForAll,
    writeContractAsync: writePerformOGSetApprovalForAll
  } = useWriteContract();

  let dataPerformOGSetApprovalForAllReceipt = useWaitForTransactionReceipt({
    hash: dataPerformOGSetApprovalForAll,
    confirmations: 2,
  });

  useEffect(() => {
    if(dataPerformOGSetApprovalForAllReceipt?.status === "success") {
      // handle successful block inclusion + no error
      setIsAwaitingOGApprovalForAllTx(false);
      toast.success(`PropyKeys NFT Approval granted to staking contract!`);
    }
    if(dataPerformOGSetApprovalForAllReceipt?.status === "error") {
      // handle successful block inclusion + error
      setIsAwaitingOGApprovalForAllTx(false);
      toast.error(`${dataPerformOGSetApprovalForAllReceipt?.error ? dataPerformOGSetApprovalForAllReceipt?.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformOGSetApprovalForAllReceipt?.status, dataPerformOGSetApprovalForAllReceipt?.error]);

  const runOGSetApprovalForAll = async () => {
    try {
      setIsAwaitingOGApprovalForAllTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformOGSetApprovalForAll({
        address: BASE_OG_STAKING_NFT,
        abi: PropyNFTABI,
        functionName: 'setApprovalForAll',
        args: [version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2, true],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          setIsAwaitingOGApprovalForAllTx(false);
          toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // APPROVE OG NFT CALLS ABOVE

  // --------------------------------------

  // STAKE CALLS BELOW

  const { 
    data: dataPerformStake,
    writeContractAsync: writePerformStake
  } = useWriteContract();

  let dataPerformStakeReceipt = useWaitForTransactionReceipt({
    hash: dataPerformStake,
    confirmations: 2,
  })

  useEffect(() => {
    if(dataPerformStakeReceipt?.status === "success") {
      // handle successful block inclusion + no error
      setIsAwaitingStakeTx(false);
      toast.success(`Stake success!`);
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync();
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync();
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false);
      }
      syncStaking();
    }
    if(dataPerformStakeReceipt?.status === "error") {
      // handle successful block inclusion + error
      setIsAwaitingStakeTx(false);
      toast.error(`${dataPerformStakeReceipt?.error ? dataPerformStakeReceipt?.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformStakeReceipt?.status, dataPerformStakeReceipt?.error, postStakeSuccess]);	

  const runStake = async () => {
    try {
      setIsAwaitingStakeTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformStake({
        address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
        abi: PRONFTStakingABI,
        functionName: 'enter',
        args: [selectedTokenAddress, selectedTokenIds],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          console.log({error})
          setIsAwaitingStakeTx(false);
          if(error?.cause?.reason === 'TIER_1_STAKING_REQUIRES_10_PROPYKEYS') {
            console.log("REQUIRES 10");
            setShowRequireTenModal(true);
          } else if(error?.cause?.reason === 'UNSTAKE_ALL_BEFORE_ADDING_MORE') {
            toast.error(`You have pending rewards, please unstake all staked tokens to claim all pending rewards before staking more tokens`);
          } else {
            toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
          }
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // STAKE CALLS ABOVE

  // --------------------------------------

  // UNSTAKING ON CHAIN CALLS BELOW

  const { 
    data: dataPerformUnstake,
    writeContractAsync: writePerformUnstake
  } = useWriteContract();

  let dataPerformUnstakeReceipt = useWaitForTransactionReceipt({
    hash: dataPerformUnstake,
    confirmations: 2,
  });

  useEffect(() => {
    if(dataPerformUnstakeReceipt?.status === "success") {
      // handle successful block inclusion + no error
      setIsAwaitingUnstakeTx(false);
      toast.success(`Unstake success!`);
      const syncStaking = async () => {
        setIsSyncingStaking(true);
        StakeService.triggerStakeOptimisticSync();
        await sleep(10000);
        await StakeService.triggerStakeOptimisticSync();
        setTriggerUpdateIndex(t => t + 1);
        if(postStakeSuccess) {
          postStakeSuccess();
        }
        setIsSyncingStaking(false)
      }
      syncStaking();
    }
    if(dataPerformUnstakeReceipt?.status === "error") {
      // handle successful block inclusion + error
      setIsAwaitingUnstakeTx(false);
      toast.error(`${dataPerformUnstakeReceipt?.error ? dataPerformUnstakeReceipt?.error : "Unable to complete transaction, please try again or contact support."}`);
    }
  }, [dataPerformUnstakeReceipt?.status, dataPerformUnstakeReceipt?.error, postStakeSuccess]);	

  const runUnstake = async () => {
    try {
      setIsAwaitingUnstakeTx(true)
      setIsAwaitingWalletInteraction(true);
      writePerformUnstake({
        address: version === 1 ? BASE_PROPYKEYS_STAKING_CONTRACT_V1 : BASE_PROPYKEYS_STAKING_CONTRACT_V2,
        abi: PRONFTStakingABI,
        functionName: 'leave',
        args: [selectedTokenAddress, selectedTokenIds],
      }, {
        onSettled() {
          setIsAwaitingWalletInteraction(false);
        },
        onError(error: any) {
          setIsAwaitingUnstakeTx(false);
          toast.error(`${error?.details ? error.details : "Unable to complete transaction, please try again or contact support."}`);
        },
      });
    } catch(e: any) {
      console.log({e});
    }
  }

  // UNSTAKING ON CHAIN CALLS ABOVE

  // --------------------------------------
  
  useEffect(() => {
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

  const getMaxHelperText = () => {
    let balance = selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT ? Number(propyKeysNFT ? propyKeysNFT.length : 0) : Number(ogKeysNFT ? ogKeysNFT?.length : 0);
    let isBalanceMoreThanMaxSelection = balance > maxSelection;
    let relevantTokenName = selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT ? "PropyKey" : "PropyOG";
    let actionName = mode === "enter" ? "stake" : "unstake";
    let currentTokenState = mode === "enter" ? "unstaked" : "staked";
    return (
      <>
        Maximum {maxSelection} tokens per transaction, you have <strong>{balance} {currentTokenState} {relevantTokenName}{balance === 1 ? "" : "s"}</strong>, therefore you {isBalanceMoreThanMaxSelection ? <>would need to perform <strong>{Math.ceil(balance / maxSelection)} separate {actionName} transactions</strong> to {actionName} all of your {currentTokenState} tokens</> : <>can {actionName} all of your {currentTokenState} tokens in a single transaction</>}
      </>
    )
  }

  return (
    <div className={classes.root}>
      {(isDeprecatedStakingVersion && (mode === "enter")) &&
        <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
          <Grid key={`single-token-card-loading-unfound`} item xs={4} sm={8} md={12} lg={20} xl={30}>
              <Typography variant="h6" style={{textAlign: 'left'}}>
                  This version of the staking contract has been deprecated, the latest version can be found <LinkWrapper style={{color: PROPY_LIGHT_BLUE}} link={`stake/v${latestStakingVersion}`}>here</LinkWrapper>.
              </Typography>
            </Grid>
        </Grid>
      }
      {(isBlacklistedOrigin && !isDeprecatedStakingVersion && (mode === "enter")) &&
        <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
          <Grid key={`single-token-card-loading-unfound`} item xs={4} sm={8} md={12} lg={20} xl={30}>
              <Typography variant="h6" style={{textAlign: 'left'}}>
                  For regulatory reasons, entering the staking protocol is not allowed from your location.
              </Typography>
            </Grid>
        </Grid>
      }
      {((!isBlacklistedOrigin && !isDeprecatedStakingVersion) || (mode === "leave")) &&
        <>
          <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
            {!(isLoading || isLoadingGeoLocation) && ((ogKeysNFT && ogKeysNFT.length > 0) || (propyKeysNFT && propyKeysNFT.length > 0)) &&
              <Grid key={`guidance-text`} item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="body1" style={{textAlign: 'left'}}>
                  {(propyKeysNFT && propyKeysNFT.length > 0) &&
                    <>
                      {`Found ${propyKeysNFT && propyKeysNFT.length > 0 ? propyKeysNFT.length : 0} PropyKeys`}<br/>
                    </>
                  }
                  {(ogKeysNFT && ogKeysNFT.length > 0) &&
                    <>
                      {`Found ${ogKeysNFT && ogKeysNFT.length > 0 ? ogKeysNFT.length : 0} PropyOG tokens`}<br/>
                    </>
                  }
                  Please click on the token(s) that you would like to {mode === "enter" ? "stake" : "unstake"}
                </Typography>
              </Grid>
            }
            {!(isLoading || isLoadingGeoLocation) && propyKeysNFT && propyKeysNFT.map((balanceRecord, index) => (
              <Grid key={`single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                <SingleTokenCard disabled={(selectedTokenAddress === BASE_OG_STAKING_NFT)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
              </Grid>  
            ))}
            {!(isLoading || isLoadingGeoLocation) && ogKeysNFT && ogKeysNFT.map((balanceRecord, index) => (
              <Grid key={`single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                <SingleTokenCard disabled={(selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === BASE_OG_STAKING_NFT)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
              </Grid>  
            ))}
            {(isLoading || isLoadingGeoLocation) && 
              <>
                <Grid key={`guidance-text`} item xs={4} sm={8} md={12} lg={20} xl={30}>
                  <Typography variant="body1" style={{textAlign: 'left'}}>
                    Loading...
                  </Typography>
                </Grid>
                {
                  Array.from({length: 15}).map((entry, index) => 
                    <Grid key={`single-token-card-loading-${index}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCardLoading />
                    </Grid>
                  )
                }
              </>
            }
            {!(isLoading || isLoadingGeoLocation) && (ogKeysNFT && ogKeysNFT.length === 0) && (propyKeysNFT && propyKeysNFT.length === 0) &&
              <Grid key={`single-token-card-loading-unfound`} item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="h6" style={{textAlign: 'left'}}>
                    {mode === "enter" ? "No unstaked tokens found" : "No staked tokens found"}
                </Typography>
              </Grid>
            }
          </Grid>
          <animated.div className={classes.floatingActionZone} style={actionZoneSpring}>
            <Card className={classes.floatingActionZoneCard} elevation={6}>
                <Typography variant="h6">
                  {mode === "enter" ? "Stake " : "Unstake "}{selectedTokenIds.length}{selectedTokenAddress === BASE_PROPYKEYS_STAKING_NFT ? " PropyKey" : " PropyOG"}{selectedTokenIds.length === 1 ? "" : "s"}
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
                            disabled={isAwaitingWalletInteraction || isAwaitingStakeTx || isSyncingStaking || new BigNumber(balanceDataPRO?.value ? balanceDataPRO?.value.toString() : 0).isLessThan(minimumRequiredPROAllowance ? minimumRequiredPROAllowance.toString() : 0)}
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
          {showRequireTenModal &&
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
          }
        </>
      }
    </div>
  );
}

export default StakeEnter;