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

import { PropsFromRedux } from '../containers/BridgeProveWithdrawalFormContainer';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-logo-transparent-bg.png';

import FloatingActionButton from './FloatingActionButton';

import { SupportedNetworks } from '../interfaces';

import CircularProgress from '@mui/material/CircularProgress';

import {
  priceFormat,
} from '../utils';

import {
  NETWORK_NAME_TO_DISPLAY_NAME,
  NETWORK_NAME_TO_ID,
  L2_TO_L1_MESSAGE_PASSER_ADDRESS,
  OPTIMISM_PORTAL_ADDRESS,
  L2_OUTPUT_ORACLE,
  BASE_BRIDGE_L1_NETWORK,
  BASE_BRIDGE_L2_NETWORK,
} from '../utils/constants';

import {
  BridgeService,
} from '../services/api';

import {
  IBaseWithdrawalInitiatedEvent,
} from '../interfaces';

import { usePrepareProveWithdrawal } from '../hooks/usePrepareProveWithdrawal';
import { useBlockNumberOfLatestL2OutputProposal } from '../base-bridge/hooks/useBlockNumberOfLatestL2OutputProposal';

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

const getBridgeProveWithdrawalButtonText = (
  isInitialized: boolean,
  isAwaitingWalletInteraction: boolean,
  isAwaitingProofTx: boolean,
  isAwaitingValidPreparation: boolean,
  isWithdrawalAlreadyProven: boolean,
  showSuccessMessage: boolean,
) => {

  if(!isInitialized) {
    return "Initializing...";
  }

  if(isWithdrawalAlreadyProven || showSuccessMessage) {
    return "Proof Submitted";
  }

  if(isAwaitingValidPreparation) {
    return "Awaiting Proof Opportunity...";
  }

  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingProofTx) {
    return "Proving Withdrawal...";
  }

  return "Prove Withdrawal";

}

const getTransitTime = (origin: string, destination: string) => {
  if(['ethereum', 'sepolia', 'goerli'].indexOf(origin) > -1 && ['base', 'base-sepolia', 'base-goerli'].indexOf(destination) > -1) {
    return `~ 20 minutes`;
  }
  if(['base', 'base-sepolia', 'base-goerli'].indexOf(origin) > -1 && ['ethereum', 'sepolia', 'base-goerli'].indexOf(destination) > -1) {
    return `~ 1 week`;
  }
}

interface IBridgeProveWithdrawalForm {
  origin: SupportedNetworks
  destination: SupportedNetworks
  transactionHash: `0x${string}`
  postBridgeSuccess?: () => void
}

const BridgeProveWithdrawalForm = (props: PropsFromRedux & IBridgeProveWithdrawalForm) => {

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
  const [isAwaitingProofTx, setIsAwaitingProofTx] = useState(false);
  const [isAwaitingWalletInteraction, setIsAwaitingWalletInteraction] = useState(false);
  const [isWithdrawalAlreadyProven, setIsWithdrawalAlreadyProven] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // L2 -> L1 PROVE WITHDRAWAL METHODS BELOW

  const blockNumberOfLatestL2OutputProposal = useBlockNumberOfLatestL2OutputProposal(
    L2_OUTPUT_ORACLE,
    NETWORK_NAME_TO_ID[destination].toString()
  );

  const proveWithdrawalConfig = usePrepareProveWithdrawal(
    transactionHash,
    blockNumberOfLatestL2OutputProposal ? blockNumberOfLatestL2OutputProposal : BigInt(0),
    NETWORK_NAME_TO_ID[origin].toString(),
    NETWORK_NAME_TO_ID[destination].toString(),
    L2_TO_L1_MESSAGE_PASSER_ADDRESS,
    OPTIMISM_PORTAL_ADDRESS,
    L2_OUTPUT_ORACLE,
    (isPrepError: boolean) => setIsAwaitingValidPreparation(isPrepError),
    (isAlreadyProven: boolean) => setIsWithdrawalAlreadyProven(isAlreadyProven),
    (isInitComplete: boolean) => setIsInitialized(isInitComplete),
  );

  const { 
    data: dataSubmitProof,
    writeAsync: submitProof,
    isLoading: isLoadingProveWithdrawal,
  } = useContractWrite({
    ...proveWithdrawalConfig,
    onError(error: any) {
      setIsAwaitingProofTx(false);
      toast.error(`${error?.details ? error.details : "Unable to submit proof, please try again or contact support."}`);
    },
    onSettled(data, error) {
      setIsAwaitingWalletInteraction(false);
    },
  });

  const handleProveWithdrawal = useCallback(() => {
    void (async () => {
      try {
        setIsAwaitingWalletInteraction(true);
        setIsAwaitingProofTx(true);
        const proveResult = await submitProof?.();
        if (proveResult?.hash) {
          // const proveTxHash = proveResult.hash;
        }
      } catch(e) {
        console.error({e});
        // onCloseProveWithdrawalModal();
      }
    })();
  }, [
    submitProof,
  ]);

  useWaitForTransaction({
    hash: dataSubmitProof?.hash,
    onSettled() {
      setIsAwaitingProofTx(false);
    },
    onSuccess() {
      toast.success(`Proof submission success! Please note that after ~ 1 week you will need to come back and finalize your withdrawal.`);
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

  // L2 -> L1 PROVE WITHDRAWAL METHODS ABOVE

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
            <Typography variant="subtitle1" className={classes.innerSpacingBottom}>Takes {getTransitTime(origin, destination)}</Typography>
            <Typography variant="subtitle1" className={classes.innerSpacingBottom}>Prove withdrawal of <span style={{fontWeight: 'bold'}}>{priceFormat(Number(utils.formatUnits(transactionData.amount, 8)), 2, 'PRO')}</span> to L1</Typography>
            <FloatingActionButton
              className={classes.submitButton}
              buttonColor="secondary"
              disabled={!isInitialized || isLoadingProveWithdrawal || isAwaitingWalletInteraction || isAwaitingProofTx || isAwaitingValidPreparation || isWithdrawalAlreadyProven || showSuccessMessage}
              onClick={handleProveWithdrawal}
              showLoadingIcon={!isInitialized || isAwaitingWalletInteraction || isAwaitingProofTx || isAwaitingValidPreparation}
              text={getBridgeProveWithdrawalButtonText(isInitialized, isAwaitingWalletInteraction, isAwaitingProofTx, isAwaitingValidPreparation, isWithdrawalAlreadyProven, showSuccessMessage)}
            />
            {isAwaitingValidPreparation && <Typography variant="caption" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem'}} className={classes.innerSpacingTop}>Waiting for L1 to have a valid checkpoint so that you can prove your withdrawal transaction was included in an L2 transaction, this may take a few minutes. Once you submit your proof, it will take ~ 1 week before you can finalize your withdrawal and receive your PRO on L1.</Typography>}
            {(isWithdrawalAlreadyProven || showSuccessMessage) && <Typography variant="caption" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem'}} className={classes.innerSpacingTop}>Proof submitted! Please note that after ~ 1 week you will need to come back and finalize your withdrawal.</Typography>}
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

export default BridgeProveWithdrawalForm;