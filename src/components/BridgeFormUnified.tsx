import React, { useState, useRef, useEffect, useMemo } from 'react';

import { animated, useSpring } from '@react-spring/web';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import * as yup from 'yup';

import EastIcon from '@mui/icons-material/East';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { useAccount, useBalance, useReadContract, useBlockNumber } from 'wagmi';

import { Formik, Form, Field, FormikProps } from 'formik';
import { TextField } from 'formik-mui';

import { PropsFromRedux } from '../containers/BridgeFormContainer';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-logo-transparent-bg.png';

import FloatingActionButton from './FloatingActionButton';

import { SupportedNetworks } from '../interfaces';

import {
  priceFormat,
} from '../utils';

import {
  NETWORK_NAME_TO_DISPLAY_NAME,
  PROPY_LIGHT_BLUE,
  BASE_BRIDGE_L1_NETWORK,
  BASE_BRIDGE_L2_NETWORK,
} from '../utils/constants';

import ERC20ABI from '../abi/ERC20ABI.json';
import L1StandardBridgeABI from '../abi/L1StandardBridgeABI.json';
import L2StandardBridgeABI from '../abi/L2StandardBridgeABI.json';

import { useUnifiedWriteContract } from '../hooks/useUnifiedWriteContract';

import {
  BridgeService,
} from '../services/api';

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
    innerSpacing: {
      marginBottom: theme.spacing(2),
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
    innerSpacingTop: {
      marginTop: theme.spacing(2),
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

interface IHelperTextMaxSelection {
  balance: string | number;
  setFieldValue: any
  origin?: SupportedNetworks
  rawBalance?: number | bigint;
  destinationAssetDecimals?: number;
  originAssetDecimals?: number;
}

const HelperTextTop = (props: IHelperTextMaxSelection) => {
  const {
    balance,
    setFieldValue,
    origin,
  } = props;
  return (
    <div style={{display: 'flex', justifyContent: 'right', marginBottom: 4, flexDirection: 'column'}}>
      <Typography variant="subtitle2" style={{textAlign: 'right', fontWeight: 400, cursor: 'pointer'}} onClick={() => setFieldValue('proAmount', balance)}>
        Balance: <strong>{priceFormat(balance, 2, origin && ['base','base-sepolia','base-goerli'].indexOf(origin) > -1 ? 'PRO (Base)' : 'PRO')}</strong>
      </Typography>
    </div>
  )
}

const HelperTextMaxSelection = (props: IHelperTextMaxSelection) => {
  const {
    balance,
    setFieldValue,
    // destinationAssetDecimals,
    // originAssetDecimals,
  } = props;
  return (
    <div style={{display: 'flex', justifyContent: 'right', marginTop: 4}}>
      <Typography variant="subtitle2" style={{textAlign: 'right', fontWeight: 400}}>
        <span style={{color: PROPY_LIGHT_BLUE, cursor: 'pointer'}} onClick={() => setFieldValue('proAmount', new BigNumber(balance).multipliedBy(0.25).toString())}>25%</span>
        &nbsp;&nbsp;
        <span style={{color: PROPY_LIGHT_BLUE, cursor: 'pointer'}} onClick={() => setFieldValue('proAmount', new BigNumber(balance).multipliedBy(0.5).toString())}>50%</span>
        &nbsp;&nbsp;
        <span style={{color: PROPY_LIGHT_BLUE, cursor: 'pointer'}} onClick={() => setFieldValue('proAmount', new BigNumber(balance).multipliedBy(0.75).toString())}>75%</span>
        &nbsp;&nbsp;
        <span style={{color: PROPY_LIGHT_BLUE, cursor: 'pointer'}} onClick={() => setFieldValue('proAmount', balance)}>100%</span>
      </Typography>
    </div>
  )
}

const isSufficientAllowance = (allowance: number, amount: string, amountDecimals: number) => {
  console.log({isSufficientAllowance: allowance, amount, amountDecimals})
  return new BigNumber(allowance).isGreaterThanOrEqualTo(utils.parseUnits(amount, amountDecimals).toString());
}

const getBridgeButtonText = (
  origin: SupportedNetworks,
  destination: SupportedNetworks,
  allowance: number,
  amount: string,
  amountDecimals: number,
  isAwaitingWalletInteraction: boolean,
  isAwaitingApproveTx: boolean,
  isAwaitingPerformTx: boolean,
) => {

  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  if(isAwaitingApproveTx) {
    return "Approving Bridge...";
  }

  if(isAwaitingPerformTx) {
    return "Bridging PRO...";
  }

  if(isSufficientAllowance(allowance, amount, amountDecimals)) {
    return "Bridge PRO";
  }

  return "Approve Bridge";

}

const getTransitTime = (origin: string, destination: string) => {
  if(['ethereum', 'sepolia', 'goerli'].indexOf(origin) > -1 && ['base', 'base-sepolia', 'base-goerli'].indexOf(destination) > -1) {
    return `~ 20 minutes`;
  }
  if(['base', 'base-sepolia', 'base-goerli'].indexOf(origin) > -1 && ['ethereum', 'sepolia', 'base-goerli'].indexOf(destination) > -1) {
    return `~ 1 week`;
  }
}

interface IBridgeForm {
  bridgeAddress: `0x${string}`
  origin: SupportedNetworks
  destination: SupportedNetworks
  originAssetAddress: `0x${string}`
  originAssetDecimals: number
  destinationAssetAddress: `0x${string}`
  destinationAssetDecimals: number
  postBridgeSuccess?: () => void
}

const BridgeFormUnified = (props: PropsFromRedux & IBridgeForm) => {

  let {
    origin,
    destination,
    originAssetAddress,
    bridgeAddress,
    originAssetDecimals,
    destinationAssetAddress,
    destinationAssetDecimals,
    postBridgeSuccess,
  } = props;

  const classes = useStyles();

  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const { 
    address,
  } = useAccount();

  const formikRef = useRef<FormikProps<{[field: string]: any}>>();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const {
    data: balanceData,
    refetch: refetchBalanceData
  } = useBalance({
    address: address,
    token: originAssetAddress,
    //watch: true,
  });

  const { 
    data: dataL1BridgePROAllowance,
    // isError,
    // isLoading
    refetch: refetchDataL1BridgePROAllowance
  } = useReadContract({
    address: originAssetAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    //watch: true,
    args: [address, bridgeAddress],
  })

  const { 
    data: dataL2BridgePROAllowance,
    refetch: refetchDataL2BridgePROAllowance,
  } = useReadContract({
    address: originAssetAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    //watch: true,
    args: [address, bridgeAddress],
  })

  useEffect(() => {
    refetchDataL2BridgePROAllowance()
    refetchBalanceData()
    refetchDataL1BridgePROAllowance()
  }, [
    blockNumber,
    refetchDataL2BridgePROAllowance,
    refetchBalanceData,
    refetchDataL1BridgePROAllowance,
  ])

  // L1 BRIDGING METHODS BELOW

  const { 
    executeTransaction: executeApproveBridgeL1Tx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionApproveBridgeL1Tx,
    isAwaitingTx: isAwaitingApproveBridgeL1Tx,
    isLoading: isLoadingApproveBridgeL1Tx,
  } = useUnifiedWriteContract({
    successToastMessage: `Approval success! You may now bridge PRO from ${NETWORK_NAME_TO_DISPLAY_NAME[origin]} to ${NETWORK_NAME_TO_DISPLAY_NAME[destination]}`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  const { 
    executeTransaction: executePerformBridgeL1Tx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformBridgeL1Tx,
    isAwaitingTx: isAwaitingPerformBridgeL1Tx,
    isLoading: isLoadingPerformBridgeL1Tx,
  } = useUnifiedWriteContract({
    onSuccess: () => {
      formikRef?.current?.resetForm();
      const refreshBridge = async () => {
        await BridgeService.triggerBaseBridgeOptimisticSync(BASE_BRIDGE_L1_NETWORK, BASE_BRIDGE_L2_NETWORK);
        if(postBridgeSuccess) {
          postBridgeSuccess();
        }
      }
      refreshBridge();
    },  
    successToastMessage: `Bridge success! Please note that it may take 20-60 minutes for your PRO tokens to arrive on ${NETWORK_NAME_TO_DISPLAY_NAME[destination]}`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // L1 BRIDGING METHODS ABOVE

  // -------------------------

  // L2 BRIDGING METHODS BELOW

  const { 
    executeTransaction: executeApproveBridgeL2Tx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionApproveBridgeL2Tx,
    isAwaitingTx: isAwaitingApproveBridgeL2Tx,
    isLoading: isLoadingApproveBridgeL2Tx,
  } = useUnifiedWriteContract({
    successToastMessage: `Approval success! You may now bridge PRO from ${NETWORK_NAME_TO_DISPLAY_NAME[origin]} to ${NETWORK_NAME_TO_DISPLAY_NAME[destination]}`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  const { 
    executeTransaction: executePerformBridgeL2Tx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionPerformBridgeL2Tx,
    isAwaitingTx: isAwaitingPerformBridgeL2Tx,
    isLoading: isLoadingPerformBridgeL2Tx,
  } = useUnifiedWriteContract({
    onSuccess: () => {
      formikRef?.current?.resetForm();const refreshBridge = async () => {
        await BridgeService.triggerBaseBridgeOptimisticSync(BASE_BRIDGE_L1_NETWORK, BASE_BRIDGE_L2_NETWORK);
        if(postBridgeSuccess) {
          postBridgeSuccess();
        }
      }
      refreshBridge();
    },  
    successToastMessage: `Withdrawal initiation success! Please note that you will need to submit a withdrawal proof before the ~ 1 week timeline to withdraw to ${NETWORK_NAME_TO_DISPLAY_NAME[destination]} begins`,
    fallbackErrorMessage: "Unable to complete transaction, please try again or contact support.",
  });

  // L2 BRIDGING METHODS ABOVE

  const isAwaitingWalletInteraction = useMemo(() => {
    return (
      isAwaitingWalletInteractionApproveBridgeL1Tx ||
      isAwaitingWalletInteractionPerformBridgeL1Tx ||
      isAwaitingWalletInteractionApproveBridgeL2Tx ||
      isAwaitingWalletInteractionPerformBridgeL2Tx
    );
  }, [
    isAwaitingWalletInteractionApproveBridgeL1Tx,
    isAwaitingWalletInteractionPerformBridgeL1Tx,
    isAwaitingWalletInteractionApproveBridgeL2Tx,
    isAwaitingWalletInteractionPerformBridgeL2Tx
  ]);

  const isAwaitingApproveTx = useMemo(() => {
    return (
      isAwaitingApproveBridgeL1Tx ||
      isAwaitingApproveBridgeL2Tx
    );
  }, [
    isAwaitingApproveBridgeL1Tx,
    isAwaitingApproveBridgeL2Tx
  ]);

  const isAwaitingPerformTx = useMemo(() => {
    return (
      isAwaitingPerformBridgeL1Tx ||
      isAwaitingPerformBridgeL2Tx
    );
  }, [
    isAwaitingPerformBridgeL1Tx,
    isAwaitingPerformBridgeL2Tx
  ]);

  const ValidationSchema = yup.object().shape({
    proAmount: yup.number()
      .required('Required'),
    hiddenField: yup.string().test('hiddenField', 'hiddenField', function (value) { setHasTriedSubmit(true); return true }),
  });

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
        <div className={classes.cardInner}>
          <div className={classes.bridgeIllustration}>
            <animated.img style={originSpring} className={[classes.networkLogo, classes.networkLogoLeft].join(" ")} src={getNetworkIcon(origin)} alt="Origin Chain" />
            <animated.div style={arrowSpring}>
              <EastIcon className={classes.singleBridgeIcon} />
            </animated.div>
            <animated.img style={destinationSpring} className={[classes.networkLogo, classes.networkLogoRight].join(" ")} src={getNetworkIcon(destination)} alt="Destination Chain" />
          </div>
          <Typography variant="h5" className={classes.cardTitleNetworks}><span style={{fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[origin]}</span> to <span style={{fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[destination]}</span></Typography>
          <Typography variant="subtitle1" className={classes.innerSpacing}>Takes {getTransitTime(origin, destination)}</Typography>
          <Formik
            //@ts-ignore
            innerRef={formikRef}
            validateOnChange={hasTriedSubmit}
            validateOnBlur={hasTriedSubmit}
            initialValues={{
              proAmount: "",
              hiddenField: "hidden",
            }}
            validationSchema={ValidationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if(["ethereum", "sepolia", "goerli"].indexOf(origin) > -1) {
                  if(isSufficientAllowance(Number(dataL1BridgePROAllowance ? dataL1BridgePROAllowance : 0), values.proAmount.toString(), originAssetDecimals)) {
                    await executePerformBridgeL1Tx({
                      address: bridgeAddress,
                      abi: L1StandardBridgeABI,
                      functionName: 'bridgeERC20',
                      args: [
                        originAssetAddress,
                        destinationAssetAddress,
                        utils.parseUnits(values.proAmount.toString(), originAssetDecimals).toString(),
                        1,
                        '0x0'
                      ]
                    });
                  } else {
                    await executeApproveBridgeL1Tx({
                      address: originAssetAddress,
                      abi: ERC20ABI,
                      functionName: 'approve',
                      args: [
                        bridgeAddress,
                        utils.parseUnits(values.proAmount.toString(), originAssetDecimals).toString(),
                      ]
                    })
                  }
                }
                if(["base", "base-sepolia", 'base-goerli'].indexOf(origin) > -1) {
                  if(isSufficientAllowance(Number(dataL2BridgePROAllowance ? dataL2BridgePROAllowance : 0), values.proAmount.toString(), originAssetDecimals)) {
                    await executePerformBridgeL2Tx({
                      address: bridgeAddress,
                      abi: L2StandardBridgeABI,
                      functionName: 'withdraw',
                      args: [
                        originAssetAddress,
                        utils.parseUnits(values.proAmount.toString(), originAssetDecimals).toString(),
                        150000,
                        '0x0'
                      ]
                    });
                  } else {
                    await executeApproveBridgeL2Tx({
                      address: originAssetAddress,
                      abi: ERC20ABI,
                      functionName: 'approve',
                      args: [
                        bridgeAddress,
                        utils.parseUnits(values.proAmount.toString(), originAssetDecimals).toString(),
                      ]
                    })
                  }
                }
              } catch(e: any) {
                setSubmitting(false);
                // toast.error(`Error: ${e?.details ? e.details : "Unable to complete transaction, please try again or contact support."}`);
                // TODO handle errors
              }
            }}
          >
            {({ submitForm, isSubmitting, handleChange, setFieldValue, errors, values }) => (
              <Form style={{width: '100%'}}>
                <Grid container spacing={0}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HelperTextTop 
                      setFieldValue={setFieldValue}
                      balance={balanceData?.formatted ? balanceData.formatted : 0}
                      rawBalance={balanceData?.value ? balanceData.value : 0}
                      origin={origin}
                      destinationAssetDecimals={destinationAssetDecimals}
                      originAssetDecimals={originAssetDecimals}
                    />
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      name="proAmount"
                      type="number"
                      label={`${origin && ['base','base-sepolia','base-goerli'].indexOf(origin) > -1 ? 'Base ' : ''}PRO Amount`}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(event)
                      }}
                      // helperText={}
                    />
                    <HelperTextMaxSelection setFieldValue={setFieldValue} balance={balanceData?.formatted ? balanceData.formatted : 0} />
                  </Grid>
                  <div style={{display: 'none'}}>
                    <Field
                      component={TextField}
                      name="hiddenField"
                      type="text"
                      label="hidden"
                    />
                  </div>
                  {/* <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Typography className={classes.formInfo} variant="h6" component="div">
                      Your information is stored securely and never used to send spam. By completing this form you agree to our <ExternalLink href="https://propy.com/browse/terms-and-conditions/">Terms of Service</ExternalLink>.
                    </Typography>
                  </Grid> */}
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <div className={classes.submitButtonContainer}>
                      {(['ethereum','sepolia','goerli'].indexOf(origin) > -1) &&
                        <FloatingActionButton
                          className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isSubmitting || !values.proAmount || (Number(values.proAmount) === 0) || isLoadingApproveBridgeL1Tx || isLoadingPerformBridgeL1Tx || isAwaitingApproveTx || isAwaitingPerformTx || isAwaitingWalletInteraction}
                          onClick={submitForm}
                          showLoadingIcon={isSubmitting || isLoadingApproveBridgeL1Tx || isLoadingPerformBridgeL1Tx || isAwaitingApproveTx || isAwaitingPerformTx || isAwaitingWalletInteraction}
                          text={getBridgeButtonText(origin, destination, Number(dataL1BridgePROAllowance ? dataL1BridgePROAllowance : 0), values.proAmount ? values.proAmount.toString() : "0", originAssetDecimals, isAwaitingWalletInteraction, isAwaitingApproveTx, isAwaitingPerformTx)}
                        />
                      }
                      {(['base','base-sepolia','base-goerli'].indexOf(origin) > -1) &&
                        <FloatingActionButton
                          className={classes.submitButton}
                          buttonColor="secondary"
                          disabled={isSubmitting || !values.proAmount || (Number(values.proAmount) === 0) || isLoadingApproveBridgeL2Tx || isLoadingPerformBridgeL2Tx || isAwaitingApproveTx || isAwaitingPerformTx || isAwaitingWalletInteraction}
                          onClick={submitForm}
                          showLoadingIcon={isSubmitting || isLoadingApproveBridgeL2Tx || isLoadingPerformBridgeL2Tx || isAwaitingApproveTx || isAwaitingPerformTx || isAwaitingWalletInteraction}
                          text={getBridgeButtonText(origin, destination, Number(dataL1BridgePROAllowance ? dataL1BridgePROAllowance : 0), values.proAmount ? values.proAmount.toString() : "0", originAssetDecimals, isAwaitingWalletInteraction, isAwaitingApproveTx, isAwaitingPerformTx)}
                        />
                      }
                    </div>
                    {(['base','base-sepolia','base-goerli'].indexOf(origin) > -1) &&
                      <Typography variant="caption" component="p" style={{textAlign: 'center', fontSize: '0.8rem', color: '#ff4500'}} className={classes.innerSpacingTop}><span style={{fontWeight: 'bold'}}>Please note:</span> Withdrawing PRO to Ethereum (L1) will require two L1 transactions to be made (a proof and a finalization). At an L1 gas price of 50 gwei, this would lead to around ~ 0.02 ETH in L1 fees.</Typography>
                    }
                    <Typography variant="caption" component="p" style={{textAlign: 'center', fontSize: '0.8rem'}} className={classes.innerSpacingTop}><span style={{fontWeight: 'bold'}}>Trying to bridge ETH?</span><br/>Please use the official <a style={{color: PROPY_LIGHT_BLUE}} className="no-decorate" href="https://bridge.base.org/deposit" target="_blank" rel="noopener noreferrer">Base Bridge</a></Typography>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
          {/* <Typography variant="subtitle1" className={classes.cardSubtitle}>Bridge time: ~ 20 minutes</Typography> */}
        </div>
      </Card>
    </div>
  );
}

export default BridgeFormUnified;