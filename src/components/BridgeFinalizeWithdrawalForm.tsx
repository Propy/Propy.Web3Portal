import React, { useState, useCallback, useEffect } from 'react';

import { animated, useSpring } from '@react-spring/web';

import { utils } from "ethers";

import BigNumber from 'bignumber.js';

import { toast } from 'sonner';

import EastIcon from '@mui/icons-material/East';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useContractWrite, useWaitForTransaction } from 'wagmi';

import CircularProgress from '@mui/material/CircularProgress';

import { PropsFromRedux } from '../containers/BridgeFinalizeWithdrawalFormContainer';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-solid.png';

import FloatingActionButton from './FloatingActionButton';

import { SupportedNetworks } from '../interfaces';

import {
  priceFormat,
} from '../utils';

import {
  NETWORK_NAME_TO_DISPLAY_NAME,
  NETWORK_NAME_TO_ID,
  OPTIMISM_PORTAL_ADDRESS,
  BASE_BRIDGE_L1_NETWORK,
  BASE_BRIDGE_L2_NETWORK,
} from '../utils/constants';

import {
  BridgeService,
} from '../services/api';

import {
  IBaseWithdrawalInitiatedEvent,
} from '../interfaces';

import { usePrepareFinalizeWithdrawal } from '../hooks/usePrepareFinalizeWithdrawal';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
    },
    title: {
      fontWeight: '500',
    },
    cardTitle: {

    },
    cardTitleNetworks: {

    },
    cardSubtitle: {
      marginBottom: theme.spacing(3),
    },
    subtitle: {
      // marginBottom: theme.spacing(2),
    },
    innerSpacingBottom: {
      marginBottom: theme.spacing(2),
    },
    innerSpacingTop: {
      marginTop: theme.spacing(2),
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    bridgeIconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    card: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      maxWidth: '420px',
    },
    cardInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(4),
      width: '100%',
    },
    bridgeIllustration: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(2),
    },
    singleBridgeIcon: {
      fontSize: '30px',
    },
    networkLogo: {
      borderRadius: '50%',
      height: 75,
    },
    networkLogoRight: {
      marginLeft: theme.spacing(2),
    },
    networkLogoLeft: {
      marginRight: theme.spacing(2),
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
  }),
);

const getNetworkIcon = (network: SupportedNetworks) => {
  if(['ethereum', 'sepolia', 'goerli'].indexOf(network) > -1) {
    return EthLogo;
  }
  if(['base', 'base-sepolia', 'base-goerli'].indexOf(network) > -1) {
    return BaseLogo;
  }
}

const getBridgeFinalizedWithdrawalButtonText = (
  isAwaitingWalletInteraction: boolean,
  isAwaitingFinalizeTx: boolean,
  isAwaitingValidPreparation: boolean,
  isWithdrawalAlreadyFinalized: boolean,
  showSuccessMessage: boolean,
  isFinalizationPeriodNotElapsed: boolean,
) => {

  if(isFinalizationPeriodNotElapsed) {
    return "Finalization Period Pending..."
  }

  if(isAwaitingValidPreparation) {
    return "Awaiting Finalization Opportunity..."
  }

  if(isWithdrawalAlreadyFinalized || showSuccessMessage) {
    return "Withdrawal Finalized";
  }

  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingFinalizeTx) {
    return "Finalizing Withdrawal...";
  }

  return "Finalize Withdrawal";

}

// const getTransitTime = (origin: string, destination: string) => {
//   if(['ethereum', 'sepolia', 'goerli'].indexOf(origin) > -1 && ['base', 'base-sepolia', 'base-goerli'].indexOf(destination)) {
//     return `~ 20 minutes`;
//   }
//   if(['base', 'base-sepolia', 'base-goerli'].indexOf(origin) > -1 && ['ethereum', 'sepolia', 'base-goerli'].indexOf(destination)) {
//     return `~ 1 week`;
//   }
// }

interface IBridgeFinalizeWithdrawalForm {
  origin: SupportedNetworks
  destination: SupportedNetworks
  transactionHash: `0x${string}`
  postBridgeSuccess?: () => void
}

const BridgeFinalizeWithdrawalForm = (props: PropsFromRedux & IBridgeFinalizeWithdrawalForm) => {

  let {
    origin,
    destination,
    transactionHash,
    postBridgeSuccess,
  } = props;

  const classes = useStyles();

  const [transactionData, setTransactionData] = useState<IBaseWithdrawalInitiatedEvent | false>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingValidPreparation, setIsAwaitingValidPreparation] = useState(false);
  const [isAwaitingFinalizeTx, setIsAwaitingFinalizeTx] = useState(false);
  const [isAwaitingWalletInteraction, setIsAwaitingWalletInteraction] = useState(false);
  const [isWithdrawalAlreadyFinalized, setIsWithdrawalAlreadyFinalized] = useState(false);
  const [isFinalizationPeriodNotElapsed, setIsFinalizationPeriodNotElapsed] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  useEffect(() => {
    // Using ReturnType to infer the type returned by setInterval
    let intervalId: ReturnType<typeof setInterval>;

    if (isFinalizationPeriodNotElapsed) {
      intervalId = setInterval(() => {
        // This will trigger a rerender every 10 seconds
        setForceUpdateCounter(prevCount => prevCount + 1);
      }, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFinalizationPeriodNotElapsed]);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactionData = async () => {
      if(transactionHash) {
        setIsLoading(true);
        let fetchedData = await BridgeService.getBaseBridgeTransactionOverviewByTransactionHash(BASE_BRIDGE_L1_NETWORK, BASE_BRIDGE_L2_NETWORK, transactionHash);
        if(isMounted && fetchedData.data) {
          setTransactionData(fetchedData.data);
          setIsLoading(false);
        }
      }
    }
    fetchTransactionData();
    return () => {
      isMounted = false;
    }
  }, [transactionHash])

  // L2 -> L1 FINALIZE WITHDRAWAL METHODS BELOW

  const finalizeWithdrawalConfig = usePrepareFinalizeWithdrawal(
    transactionHash,
    NETWORK_NAME_TO_ID[origin].toString(),
    NETWORK_NAME_TO_ID[destination].toString(),
    OPTIMISM_PORTAL_ADDRESS,
    (isPrepError: boolean) => setIsAwaitingValidPreparation(isPrepError),
    (isAlreadyFinalized: boolean) => setIsWithdrawalAlreadyFinalized(isAlreadyFinalized),
    (finalizationPeriodNotElapsed: boolean) => setIsFinalizationPeriodNotElapsed(finalizationPeriodNotElapsed),
    forceUpdateCounter,
  );

  const { 
    data: dataSubmitFinalize,
    writeAsync: submitFinalize,
    isLoading: isLoadingFinalizeWithdrawal,
  } = useContractWrite({
    ...finalizeWithdrawalConfig,
    onError(error: any) {
      setIsAwaitingFinalizeTx(false);
      toast.error(`${error?.details ? error.details : "Unable to submit finalization, please try again or contact support."}`);
    },
    onSettled(data, error) {
      setIsAwaitingWalletInteraction(false);
    },
  });

  const handleFinalizeWithdrawal = useCallback(() => {
    void (async () => {
      try {
        setIsAwaitingWalletInteraction(true);
        setIsAwaitingFinalizeTx(true);
        const finalizeResult = await submitFinalize?.();
        if (finalizeResult?.hash) {
          // const finalizeTxHash = finalizeResult.hash;
        }
      } catch(e) {
        console.error({e});
        // onCloseFinalizeWithdrawalModal();
      }
    })();
  }, [
    submitFinalize,
  ]);

  useWaitForTransaction({
    hash: dataSubmitFinalize?.hash,
    onSettled() {
      setIsAwaitingFinalizeTx(false);
    },
    onSuccess() {
      toast.success(`Withdrawal finalized! Tokens have been withdrawn to L1.`);
      setShowSuccessMessage(true);
      const refreshBridge = async () => {
        await BridgeService.triggerBaseBridgeOptimisticSync(BASE_BRIDGE_L1_NETWORK, BASE_BRIDGE_L2_NETWORK);
        if(postBridgeSuccess) {
          postBridgeSuccess();
        }
      }
      refreshBridge();
    }
  })

  // L2 -> L1 FINALIZE WITHDRAWAL METHODS ABOVE

  const originSpring = useSpring({
    from: {
      transform: 'translateX(25%)',
    },
    to: {
      transform: 'translateX(0%)',
    },
  })

  const destinationSpring = useSpring({
    from: {
      transform: 'translateX(-25%)',
    },
    to: {
      transform: 'translateX(0%)',
    },
  })

  const arrowSpring = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    delay: 150,
  })

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        {transactionData && !isLoading &&
          <div className={classes.cardInner}>
            <div className={classes.bridgeIllustration}>
              <animated.img style={originSpring} className={[classes.networkLogo, classes.networkLogoLeft].join(" ")} src={getNetworkIcon(origin)} alt="Origin Chain" />
              <animated.div style={arrowSpring}>
                <EastIcon className={classes.singleBridgeIcon} />
              </animated.div>
              <animated.img style={destinationSpring} className={[classes.networkLogo, classes.networkLogoRight].join(" ")} src={getNetworkIcon(destination)} alt="Destination Chain" />
            </div>
            <Typography variant="h5" className={classes.cardTitleNetworks}><span style={{fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[origin]}</span> to <span style={{fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[destination]}</span></Typography>
            <Typography variant="subtitle1" className={classes.innerSpacingBottom}>Finalize withdrawal of <span style={{fontWeight: 'bold'}}>{priceFormat(Number(utils.formatUnits(transactionData.amount, 8)), 2, 'PRO')}</span> to L1</Typography>
            <FloatingActionButton
              className={classes.submitButton}
              buttonColor="secondary"
              disabled={isLoadingFinalizeWithdrawal || isAwaitingWalletInteraction || isAwaitingFinalizeTx || isAwaitingValidPreparation || isWithdrawalAlreadyFinalized || showSuccessMessage || isFinalizationPeriodNotElapsed}
              onClick={handleFinalizeWithdrawal}
              showLoadingIcon={isAwaitingWalletInteraction || isAwaitingFinalizeTx || isAwaitingValidPreparation || isFinalizationPeriodNotElapsed}
              text={getBridgeFinalizedWithdrawalButtonText(isAwaitingWalletInteraction, isAwaitingFinalizeTx, isAwaitingValidPreparation, isWithdrawalAlreadyFinalized, showSuccessMessage, isFinalizationPeriodNotElapsed)}
            />
            {isAwaitingValidPreparation && <Typography variant="caption" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem'}} className={classes.innerSpacingTop}>Waiting for your withdrawal proof to make it through the challenge period, this will take around ~ 1 week from the time of submitting your withdrawal proof.</Typography>}
            {(isWithdrawalAlreadyFinalized || showSuccessMessage) && <Typography variant="caption" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem'}} className={classes.innerSpacingTop}>Withdrawal finalized! Tokens have been withdrawn to L1.</Typography>}
          </div>
        }
        {isLoading &&
          <div className={classes.cardInner}>
            <CircularProgress color="inherit" style={{height: '32px', width: '32px', marginBottom: '16px'}} />
            <Typography variant="h5">Loading transaction...</Typography>
          </div>
        }
        {!isLoading && !transactionData && 
          <div className={classes.cardInner}>
            <Typography variant="h5">Transaction not found</Typography>
          </div>
        }
      </Card>
    </div>
  );
}

export default BridgeFinalizeWithdrawalForm;