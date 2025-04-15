import React, { useState, useEffect, useId, useMemo } from 'react';

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
import CardActionArea from '@mui/material/CardActionArea';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import MoneyIcon from '@mui/icons-material/Paid';
import FireIcon from '@mui/icons-material/LocalFireDepartment';
import BackIcon from '@mui/icons-material/KeyboardBackspace';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import RaTier2Icon from '../assets/svg/ra_tier_2.svg';

import { useAccount, useBalance, useReadContract, useBlockNumber } from 'wagmi';

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
  STAKING_V3_CONTRACT_ADDRESS,
  STAKING_V3_PROPYKEYS_MODULE_ADDRESS,
  STAKING_V3_LP_MODULE_ADDRESS,
  STAKING_V3_PRO_MODULE_ADDRESS,
  STAKING_V3_PROPYKEYS_ADDRESS,
  STAKING_V3_PROPYOG_ADDRESS,
  STAKING_V3_UNISWAP_NFT_ADDRESS,
  STAKING_V3_PRO_ADDRESS,
  STAKING_V3_UNISWAP_LP_HELPER_ADDRESS,
  STAKING_V3_CORE_CONTRACT_ADDRESS,
  STAKING_ORIGIN_COUNTRY_BLACKLIST,
  PROPY_LIGHT_BLUE,
  STAKING_V3_PK_MODULE_ID,
  STAKING_V3_ERC20_MODULE_ID,
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
import PropyKeyStakingV3ModuleABI from '../abi/PropyKeyStakingV3ModuleABI.json';
import PRONFTStakingV3CoreABI from '../abi/PRONFTStakingV3CoreABI.json';
import LPNFTHelperABI from '../abi/LPNFTHelperABI.json';

import {
  AccountBalanceService,
  StakeService,
  GeoService,
} from '../services/api';

import { useStakerModuleUnlockTime, useUnifiedWriteContract } from '../hooks';

import {
  decodeUniswapNFTTokenURI,
} from '../utils';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
  version: number
}

type UniswapPositionDetailsRaw = [
  liquidity: bigint,    // uint128 - current liquidity amount
  tickUpper: number,    // int24 - upper tick boundary
  tickLower: number,    // int24 - lower tick boundary
  amount0: bigint,      // uint256 - amount of token0 
  amount1: bigint,      // uint256 - amount of token1
  positionEstimateToken0: bigint // uint256 - estimated PRO value of position
]

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
  isPropyKeysStakingContractApproved: boolean,
  isPropyOGsStakingContractApproved: boolean,
  isUniswapLPsStakingContractApproved: boolean,
  currentStakingContractAllowance: string,
  requiredPROAllowance: string,
  stakingPowerToUnstakePK: string,
  stakingContractStakingPowerAllowance: string,
) => {
  // todo
  // use currentStakingContractAllowance & requiredAllowance
  if(mode === "enter") {
    let isSufficientAllowancePRO = new BigNumber(currentStakingContractAllowance).isGreaterThanOrEqualTo(requiredPROAllowance);
    if(selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS) {
      console.log({isSufficientAllowancePRO, requiredPROAllowance, currentStakingContractAllowance})
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
    } else if(selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS) {
      if (!isUniswapLPsStakingContractApproved) {
        return 0;
      } else if (isUniswapLPsStakingContractApproved) {
        return 1;
      }
    }
  } else if (mode === "leave") {
    let isSufficientAllowanceStakingPower = new BigNumber(stakingContractStakingPowerAllowance).isGreaterThanOrEqualTo(stakingPowerToUnstakePK);
    if(!isSufficientAllowanceStakingPower) {
      return 0;
    } else {
      return 0;
    }
  }
  return 0;
}

const StakePortalV3 = (props: PropsFromRedux & IStakeEnter) => {

  const {
    mode,
    postStakeSuccess,
    version,
  } = props;

  const [selectedStakingModule, setSelectedStakingModule] = useState<false | "pro" | "lp" | "propykeys">(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<false | string>(false);

  const uniqueId = useId();

  const classes = useStyles();

  const latestStakingVersion = 3;

  const maxSelection = 100;
  const maxSelectionLP = 1;

  let isDeprecatedStakingVersion = false;

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { chain } = useAccount();

  const [nftAssets, setNftAssets] = useState<INftAssets>({});
  const [propyKeysNFT, setPropyKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [propyKeysNFTPaginationData, setPropyKeysNFTPaginationData] = useState<false | IPaginationNoOptional>(false);
  const [uniswapLPNFT, setUniswapLPNFT] = useState<false | IBalanceRecord[]>(false);
  const [uniswapLPNFTPaginationData, setUniswapLPNFTPaginationData] = useState<false | IPaginationNoOptional>(false);
  const [maxStakedLoadCount, setMaxStakedLoadCount] = useState(100);
  const [maxUnstakedLoadCount, setMaxUnstakedLoadCount] = useState(100);
  const [ogKeysNFT, setOGKeysNFT] = useState<false | IBalanceRecord[]>(false);
  const [ogKeysNFTPaginationData, setOGKeysNFTPaginationData] = useState<false | IPaginationNoOptional>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<false | string>(false);
  const [activeStep, setActiveStep] = useState<0|1>(0);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // const [showRequireTenModal, setShowRequireTenModal] = useState(false);
  const [isSyncingStaking, setIsSyncingStaking] = useState(false);
  const [lastSelectedPropyKeyTokenId, setLastSelectedPropyKeyTokenId] = useState(0);
  const [lastSelectedUniswapTokenId, setLastSelectedUniswapTokenId] = useState(0);
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
        } else if (selectedStakingModule === "lp") {
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
      if(balanceRecord?.nft?.asset_address === STAKING_V3_PROPYKEYS_ADDRESS) {
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
      setSelectedTokenIds(newSelection);
    }
    setLastErrorMessage(false);
  };

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
    // if(STAKING_ORIGIN_COUNTRY_BLACKLIST.indexOf(clientCountry) > -1) {
    //   setIsBlacklistedOrigin(true);
    // } else {
    //   setIsBlacklistedOrigin(false);
    // }
  }, [clientCountry])
  
  console.log({clientCountry})

  const { 
    data: dataPropyKeysIsStakingContractApproved,
    queryKey: dataPropyKeysIsStakingContractApprovedQueryKey
  } = useReadContract({
    address: STAKING_V3_PROPYKEYS_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'isApprovedForAll',
    args: [address, STAKING_V3_PROPYKEYS_MODULE_ADDRESS],
  });

  console.log({dataPropyKeysIsStakingContractApproved})

  const { 
    data: lastSelectedTokenTier,
    queryKey: lastSelectedTokenTierQueryKey
  } = useReadContract({
    address: STAKING_V3_PROPYKEYS_ADDRESS,
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

  const {
    data: lastSelectedUniswapTokenURI,
    queryKey: lastSelectedUniswapTokenURIQueryKey
  } = useReadContract({
    address: STAKING_V3_UNISWAP_NFT_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'tokenURI',
    args: [lastSelectedUniswapTokenId],
  })

  useEffect(() => {
    if(Number(lastSelectedUniswapTokenId) > 0) {
      queryClient.invalidateQueries({ queryKey: lastSelectedUniswapTokenPositionDetailsQueryKey })
    }
  }, [blockNumber, queryClient, lastSelectedUniswapTokenId, lastSelectedUniswapTokenPositionDetailsQueryKey, lastSelectedUniswapTokenURIQueryKey]);

  const { 
    data: stakerToStakedCount,
    queryKey: stakerToStakedCountQueryKey,
  } = useReadContract({
    address: STAKING_V3_CONTRACT_ADDRESS,
    abi: StakingV3CombinedErrorsABI,
    functionName: 'stakerToStakedTokenCount',
    args: [address ? address : ""],
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
    data: minimumRequiredPROAllowance,
    isLoading: isLoadingMinimumRequiredPROAllowance,
    queryKey: minimumRequiredPROAllowanceQueryKey,
  } = useReadContract({
    address: STAKING_V3_CONTRACT_ADDRESS,
    abi: StakingV3CombinedErrorsABI,
    functionName: 'getPROAmountToStake',
    args: [selectedTokenAddress, selectedTokenIds],
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

  const { 
    data: stakerUnlockTimePRO,
    // isLoading: isLoadingStakerUnlockTime,
  } = useStakerModuleUnlockTime(
    STAKING_V3_CORE_CONTRACT_ADDRESS,
    address,
    chain ? chain.id : undefined,
    STAKING_V3_ERC20_MODULE_ID,
  );

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
    data: balanceDataPRO,
    queryKey: balanceDataPROQueryKey
  } = useBalance({
    address: address,
    token: STAKING_V3_PRO_ADDRESS,
  });

  const {
    data: balanceDataPropyKeys,
    queryKey: balanceDataPropyKeysQueryKey,
  } = useReadContract({
    address: STAKING_V3_PROPYKEYS_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const {
    data: balanceDataPropyOG,
    queryKey: balanceDataPropyOGQueryKey,
  } = useReadContract({
    address: STAKING_V3_PROPYOG_ADDRESS,
    abi: PropyNFTABI,
    functionName: 'balanceOf',
    args: [address],
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
      sharesIssuedAgainstSelectionPKQueryKey,
      stakingContractStakingPowerAllowanceQueryKey,
      dataPropyOGsIsStakingContractApprovedQueryKey,
      dataUniswapLPsIsStakingContractApprovedQueryKey,
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
    sharesIssuedAgainstSelectionPKQueryKey,
    stakingContractStakingPowerAllowanceQueryKey,
    dataPropyOGsIsStakingContractApprovedQueryKey,
    dataUniswapLPsIsStakingContractApprovedQueryKey,
    stakingContractPROAllowanceQueryKey,
    minimumRequiredPROAllowanceQueryKey,
  ]);

  // useEffect(() => {
  //   let currentTotal = 0;
  //   if(Number(stakerToStakedCount) > 0) {
  //     currentTotal += Number(stakerToStakedCount);
  //   }
  //   if(Number(balanceDataPropyKeys) > 0) {
  //     currentTotal += Number(balanceDataPropyKeys);
  //   }
  //   if(Number(balanceDataPropyOG) > 0) {
  //     currentTotal += Number(balanceDataPropyOG);
  //   }
  //   if((Number(lastSelectedTokenTier) === 1) && lastSelectedPropyKeyTokenId && (currentTotal < 10) && (mode === "enter")) {
  //     setShowRequireTenModal(true);
  //     setLastSelectedPropyKeyTokenId(0);
  //   } else if(mode === "leave") {
  //     setShowRequireTenModal(false);
  //   }
  // }, [lastSelectedTokenTier, lastSelectedPropyKeyTokenId, stakerToStakedCount, balanceDataPropyKeys, balanceDataPropyOG, mode])

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
      args: [STAKING_V3_CONTRACT_ADDRESS, minimumRequiredPROAllowance],
    }, 
    successToastMessage: `Granted PRO Allowance!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE PRO ON CHAIN CALLS ABOVE

  // --------------------------------------

  // APPROVE PRO ON CHAIN CALLS BELOW

  const { 
    executeTransaction: executePerformPStakeAllowanceTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformPStakeAllowanceTx,
    isAwaitingTx: isAwaitingPerformPStakeAllowanceTx,
    // isLoading: isLoadingPerformPStakeAllowanceTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CORE_CONTRACT_ADDRESS,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [STAKING_V3_CORE_CONTRACT_ADDRESS, sharesIssuedAgainstSelectionPK],
    }, 
    successToastMessage: `Granted pSTAKE Allowance!`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // APPROVE pSTAKE ON CHAIN CALLS ABOVE

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

  // APPROVE PROPYKEYS NFT CALLS BELOW

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

  // APPROVE PROPYKEYS NFT CALLS ABOVE

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
      args: [selectedTokenAddress, selectedTokenIds, 3],
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
      } else if (error === 'UNSTAKE_ALL_BEFORE_ADDING_MORE') {
        errorMessage = `You have pending rewards, please unstake all staked tokens to claim all pending rewards before staking more tokens.`
      } else {
        errorMessage = error?.details ? error.details : `Unable to complete transaction, please try again or contact support (error: ${error}).`
      }
      toast.error(errorMessage);
      setLastErrorMessage(errorMessage);
    }
  });

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
      args: [selectedTokenIds, 3],
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
    executeTransaction: executePerformUnstakeTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformUnstakeTx,
    isAwaitingTx: isAwaitingPerformUnstakeTx,
    // isLoading: isLoadingPerformUnstakeTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: STAKING_V3_CONTRACT_ADDRESS,
      abi: StakingV3CombinedErrorsABI,
      functionName: 'leave',
      args: [selectedTokenAddress, selectedTokenIds],
    },
    successToastMessage: `Unstake success!`,
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
    let latestActiveStep : 0|1|2 = getActiveStep(
      mode,
      selectedTokenAddress,
      Boolean(dataPropyKeysIsStakingContractApproved),
      Boolean(dataPropyOGsIsStakingContractApproved),
      Boolean(dataUniswapLPsIsStakingContractApproved),
      `${stakingContractPROAllowance}`,
      `${minimumRequiredPROAllowance}`,
      `${sharesIssuedAgainstSelectionPK}`,
      `${stakingContractStakingPowerAllowance}`,
    );
    setActiveStep(latestActiveStep);
  }, [mode, selectedTokenAddress, dataPropyKeysIsStakingContractApproved, dataPropyOGsIsStakingContractApproved, dataUniswapLPsIsStakingContractApproved, stakingContractPROAllowance, minimumRequiredPROAllowance, sharesIssuedAgainstSelectionPK, stakingContractStakingPowerAllowance])

  const isAwaitingWalletInteraction = useMemo(() => {
    return (
      isAwaitingWalletInteractionPerformPStakeAllowanceTx ||
      isAwaitingWalletInteractionPerformPROAllowanceTx ||
      isAwaitingWalletInteractionPerformPropyKeysSetApprovalForAllTx ||
      isAwaitingWalletInteractionPerformOGSetApprovalForAllTx ||
      isAwaitingWalletInteractionPerformStakeTx ||
      isAwaitingWalletInteractionPerformUnstakeTx ||
      isAwaitingWalletInteractionPerformStakeLPTx ||
      // isAwaitingWalletInteractionPerformUnstakeLPTx ||
      isAwaitingWalletInteractionPerformUniswapLPSetApprovalForAllTx
    );
  }, [
    isAwaitingWalletInteractionPerformPStakeAllowanceTx,
    isAwaitingWalletInteractionPerformPROAllowanceTx,
    isAwaitingWalletInteractionPerformPropyKeysSetApprovalForAllTx,
    isAwaitingWalletInteractionPerformOGSetApprovalForAllTx,
    isAwaitingWalletInteractionPerformStakeTx,
    isAwaitingWalletInteractionPerformUnstakeTx,
    isAwaitingWalletInteractionPerformStakeLPTx,
    isAwaitingWalletInteractionPerformUniswapLPSetApprovalForAllTx,
  ]);

  const disableSelectionAdjustments = useMemo(() => {
    return (
      isAwaitingPerformPropyKeysSetApprovalForAllTx || 
      isAwaitingWalletInteraction || 
      isAwaitingPerformOGSetApprovalForAllTx || 
      isAwaitingPerformPROAllowanceTx || 
      isAwaitingPerformStakeTx || 
      isAwaitingPerformStakeLPTx || 
      isAwaitingPerformPStakeAllowanceTx || 
      isAwaitingPerformUnstakeTx || 
      isSyncingStaking
    )
  }, [
    isAwaitingPerformPropyKeysSetApprovalForAllTx, 
    isAwaitingWalletInteraction, 
    isAwaitingPerformOGSetApprovalForAllTx, 
    isAwaitingPerformPROAllowanceTx, 
    isAwaitingPerformStakeTx,
    isAwaitingPerformStakeLPTx,
    isAwaitingPerformPStakeAllowanceTx, 
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

  console.log({lastSelectedUniswapTokenPositionDetails, lastSelectedUniswapTokenURI})

  return (
    <>
      {selectedStakingModule &&
        <div style={{cursor: 'pointer', color: PROPY_LIGHT_BLUE, textAlign: 'left', marginBottom: 16, display: 'flex', alignItems: 'center'}} onClick={() => {setSelectedStakingModule(false);setSelectedTokenIds([]);setSelectedTokenAddress(false)}}>
          <BackIcon style={{marginRight: '8px'}} />
          <Typography variant="body1" style={{fontWeight: 'bold'}}>
            Back to staking options
          </Typography>
        </div>
      }
      <div className={classes.root}>
        {(isDeprecatedStakingVersion && (mode === "enter")) &&
          <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
            <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="h6" style={{textAlign: 'left'}}>
                    This version of the staking contract has been deprecated, the latest version can be found <LinkWrapper style={{color: PROPY_LIGHT_BLUE}} link={`stake/v${latestStakingVersion}`}>here</LinkWrapper>.
                </Typography>
              </Grid>
          </Grid>
        }
        {(isBlacklistedOrigin && !isDeprecatedStakingVersion && (mode === "enter")) &&
          <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
            <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="h6" style={{textAlign: 'left'}}>
                    For regulatory reasons, entering the staking protocol is not allowed from your location.
                </Typography>
              </Grid>
          </Grid>
        }
        {!selectedStakingModule &&
          <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
            <Grid item xs={4} sm={8} md={12} lg={30} xl={30}>
              <Typography variant="h5" style={{textAlign: 'center'}}>
                What would you like to stake?
              </Typography>
            </Grid>
            <Grid item xs={4} sm={8} md={12} lg={30} xl={10}>
              <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  setSelectedStakingModule("lp")
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <AssuredWorkloadIcon style={{height: 100, width: 100, color: PROPY_LIGHT_BLUE }} />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Uniswap NFT
                  </Typography>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <FireIcon style={{color: '#ff6f00', height: 35, width: 35, marginBottom: '16px', marginRight: '8px'}} />
                    <Typography variant="h5" className={classes.cardSubtitle}>
                      <strong>500%</strong> Base Rewards
                    </Typography>
                    <FireIcon style={{color: '#ff6f00', height: 35, width: 35, marginBottom: '16px', marginLeft: '8px'}} />
                  </div>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Get the <strong>highest possible staking rewards</strong> by providing liquidity to the specified PRO-WETH liquidity pool.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
            <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  setSelectedStakingModule("pro")
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <MoneyIcon style={{height: 100, width: 100, color: PROPY_LIGHT_BLUE }} />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    PRO
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    <strong>100%</strong> Base Rewards
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Straightforward PRO token staking without any additional steps to acquire PropyKey NFTs or provide liquidity to Uniswap.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
              <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  setSelectedStakingModule("propykeys")
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <img src={RaTier2Icon} className={classes.tierIcon}  alt="PropyKeys" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    PropyKeys NFT
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    <strong>100%</strong> Base Rewards
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Stake your PropyKeys to get rewarded for being part of the community! Rewards scale according to PropyKey token tiers.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        }
        {selectedStakingModule === "propykeys" &&
          <>
            {((!isBlacklistedOrigin && !isDeprecatedStakingVersion) || (mode === "leave")) &&
              <>
                <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {!(isLoading || isLoadingGeoLocation) && ((ogKeysNFT && ogKeysNFT.length > 0) || (propyKeysNFT && propyKeysNFT.length > 0)) &&
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
                  {!(isLoading || isLoadingGeoLocation) && propyKeysNFT && propyKeysNFT.map((balanceRecord, index) => (
                    <Grid key={`${uniqueId}-single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCard disabled={(selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
                    </Grid>  
                  ))}
                  {!(isLoading || isLoadingGeoLocation) && ogKeysNFT && ogKeysNFT.map((balanceRecord, index) => (
                    <Grid key={`${uniqueId}-single-token-card-${index}-${balanceRecord.asset_address}-${balanceRecord.token_id}`} item xs={4} sm={4} md={6} lg={5} xl={6}>
                      <SingleTokenCard disabled={(selectedTokenAddress === STAKING_V3_PROPYKEYS_ADDRESS)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelected} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
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
                    (mode === "enter") && ((ogKeysNFT && ogKeysNFT?.length > 0) || (propyKeysNFT && propyKeysNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count)) && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count)))}
                          onClick={() => setMaxUnstakedLoadCount(maxUnstakedLoadCount + 100)}
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
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
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
                          text={(
                            (propyKeysNFTPaginationData && (propyKeysNFTPaginationData?.total === propyKeysNFTPaginationData?.count))
                            && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {!(isLoading || isLoadingGeoLocation) && (ogKeysNFT && ogKeysNFT.length === 0) && (propyKeysNFT && propyKeysNFT.length === 0) &&
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
                            <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
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
                              <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
                                {/* <Typography className={classes.buttonTitleSmallSpacing} variant="subtitle2">PRO Balance: {priceFormat(Number(utils.formatUnits(Number(balanceDataPRO?.value ? balanceDataPRO?.value : 0), 8)), 2, 'PRO', false, true)}</Typography>
                                <Typography className={classes.buttonTitle} variant="subtitle2">{priceFormat(Number(utils.formatUnits(Number(minimumRequiredPROAllowance ? minimumRequiredPROAllowance : 0), 8)), 2, 'PRO', false, true)} Required</Typography> */}
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingWalletInteraction || isAwaitingPerformStakeTx || isSyncingStaking}
                                  onClick={() => {executePerformStakeTx();setLastErrorMessage(false)}}
                                  showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformStakeTx || isSyncingStaking}
                                  text={getStakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformStakeTx, isSyncingStaking)}
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
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingPerformUnstakeTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimePropyKeys) * 1000 > new Date().getTime()) || isSyncingStaking}
                                  onClick={() => executePerformUnstakeTx()}
                                  showLoadingIcon={isAwaitingPerformUnstakeTx || isAwaitingWalletInteraction || isSyncingStaking}
                                  text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformUnstakeTx, isSyncingStaking)}
                                />
                                {(Number(stakerUnlockTimePropyKeys) * 1000 > new Date().getTime()) &&
                                  <Typography className={classes.buttonSubtitle} variant="subtitle2">Locked for {countdownToTimestamp(Number(stakerUnlockTimePropyKeys), "")}</Typography>
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
                            <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
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
        {selectedStakingModule === "lp" &&
          <>
            {((!isBlacklistedOrigin && !isDeprecatedStakingVersion) || (mode === "leave")) &&
              <>
                <Grid className={(isLoading || isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={disableSelectionAdjustments ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {!(isLoading || isLoadingGeoLocation) && ((ogKeysNFT && ogKeysNFT.length > 0) || (uniswapLPNFT && uniswapLPNFT.length > 0)) &&
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
                      <SingleTokenCard imageObjectFit={'contain'} imageHeight={"300px"} cardHeight={"398px"} disabled={(selectedTokenAddress === STAKING_V3_PROPYOG_ADDRESS)} selected={(selectedTokenIds.indexOf(Number(balanceRecord.token_id)) > -1) && (selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS)} onBalanceRecordSelected={handleBalanceRecordSelectedSingle} selectable={true} balanceRecord={balanceRecord} assetRecord={nftAssets[balanceRecord?.asset_address]} />
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
                    (mode === "enter") && ((ogKeysNFT && ogKeysNFT?.length > 0) || (uniswapLPNFT && uniswapLPNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count)) && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count)))}
                          onClick={() => setMaxUnstakedLoadCount(maxUnstakedLoadCount + 100)}
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
                          text={(
                            (uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count))
                            && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {
                    (mode === "leave") && ((ogKeysNFT && ogKeysNFT?.length > 0) || (uniswapLPNFT && uniswapLPNFT?.length > 0)) &&
                      <div className={classes.loadMoreButtonContainer}>
                        <FloatingActionButton
                          // className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isLoading || ((uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count)) && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count)))}
                          onClick={() => setMaxStakedLoadCount(maxStakedLoadCount + 100)}
                          showLoadingIcon={isLoading || isLoadingGeoLocation}
                          text={(
                            (uniswapLPNFTPaginationData && (uniswapLPNFTPaginationData?.total === uniswapLPNFTPaginationData?.count))
                            && (ogKeysNFTPaginationData && (ogKeysNFTPaginationData?.total === ogKeysNFTPaginationData?.count))
                          ) ? "All Records Loaded" : "Load More"}
                        />
                      </div>
                  }
                  {!(isLoading || isLoadingGeoLocation) && (ogKeysNFT && ogKeysNFT.length === 0) && (uniswapLPNFT && uniswapLPNFT.length === 0) &&
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
                            <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
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
                                ((selectedTokenAddress === STAKING_V3_UNISWAP_NFT_ADDRESS))
                                && activeStep === 1
                              ) &&
                              <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
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
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingWalletInteraction || isAwaitingPerformStakeLPTx || isSyncingStaking || !lastSelectedUniswapTokenPositionDetails || Boolean(getLpPositionDetailsError(lastSelectedUniswapTokenPositionDetails))}
                                  onClick={() => {executePerformStakeLPTx();setLastErrorMessage(false)}}
                                  showLoadingIcon={isAwaitingWalletInteraction || isAwaitingPerformStakeLPTx || isSyncingStaking}
                                  text={getStakeButtonTextLP(isAwaitingWalletInteraction, isAwaitingPerformStakeLPTx, isSyncingStaking, lastSelectedUniswapTokenPositionDetails)}
                                />
                                <Typography className={classes.buttonSubtitle} variant="subtitle2">Staking causes a 3-day lockup period on all staked tokens, including tokens that are already staked. You cannot unstake any tokens during the lockup period.</Typography>
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
                                  Estimated Reward: {priceFormat(Number(utils.formatUnits(Number((cumulativeRewardsPerShare?.toString() && stakerToModuleIdToCumulativeRewardsPerShareLP?.toString() && sharesIssuedAgainstSelectionLP?.toString()) ? (new BigNumber(cumulativeRewardsPerShare.toString()).minus(stakerToModuleIdToCumulativeRewardsPerShareLP.toString()).multipliedBy(sharesIssuedAgainstSelectionLP.toString()).toString()) : 0).toString(), 16)), 2, 'PRO', false, true)} 
                                  {/* <Tooltip placement="top" title={`Unstaking t.`}>
                                    <HelpIcon className={'tooltip-helper-icon'} />
                                  </Tooltip> */}
                                </Typography>
                                <FloatingActionButton
                                  className={classes.submitButton}
                                  buttonColor="secondary"
                                  disabled={isAwaitingPerformUnstakeLPTx || isAwaitingWalletInteraction || (Number(stakerUnlockTimeLP) * 1000 > new Date().getTime()) || isSyncingStaking}
                                  onClick={() => executePerformUnstakeLPTx()}
                                  showLoadingIcon={isAwaitingPerformUnstakeLPTx || isAwaitingWalletInteraction || isSyncingStaking}
                                  text={getUnstakeButtonText(isAwaitingWalletInteraction, isAwaitingPerformUnstakeTx, isSyncingStaking)}
                                />
                                {(Number(stakerUnlockTimeLP) * 1000 > new Date().getTime()) &&
                                  <Typography className={classes.buttonSubtitle} variant="subtitle2">Locked for {countdownToTimestamp(Number(stakerUnlockTimeLP), "")}</Typography>
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
                            <div style={{maxWidth: 350, marginLeft: 'auto', marginRight: 'auto'}}>
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