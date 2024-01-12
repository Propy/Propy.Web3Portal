import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// import { Theme } from '@mui/material/styles';

// import makeStyles from '@mui/styles/makeStyles';
// import createStyles from '@mui/styles/createStyles';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';

import { SupportedNetworks } from '../interfaces';

import {
  BRIDGE_SELECTION_TO_TRANSACTION_ACTION_TO_REQUIRED_NETWORK,
  BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK,
} from '../utils/constants';

import BridgeProveWithdrawalFormContainer from '../containers/BridgeProveWithdrawalFormContainer';
import BridgeFinalizeWithdrawalFormContainer from '../containers/BridgeFinalizeWithdrawalFormContainer';

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     sectionSpacerTop: {
//       marginTop: theme.spacing(4),
//     },
//   }),
// );

const BridgeTransactionActionPage = () => {

  let { 
    bridgeSelection,
    bridgeAction,
    transactionHash,
  } = useParams();

  const [requiredNetwork, setRequiredNetwork] = useState<false | SupportedNetworks>(false);
  const [bridgeAddress, setBridgeAddress] = useState<false | `0x${string}`>(false);
  const [originNetwork, setOriginNetwork] = useState<false | SupportedNetworks>(false);
  const [destinationNetwork, setDestinationNetwork] = useState<false | SupportedNetworks>(false);
  const [originAssetAddress, setOriginAssetAddress] = useState<false | `0x${string}`>(false);
  const [originAssetDecimals, setOriginAssetDecimals] = useState<false | number>(false);
  const [destinationAssetAddress, setDestinationAssetAddress] = useState<false | `0x${string}`>(false);
  const [destinationAssetDecimals, setDestinationAssetDecimals] = useState<false | number>(false);

  useEffect(() => {
    if(bridgeSelection && bridgeAction && BRIDGE_SELECTION_TO_TRANSACTION_ACTION_TO_REQUIRED_NETWORK?.[bridgeSelection]?.[bridgeAction]) {
      setRequiredNetwork(BRIDGE_SELECTION_TO_TRANSACTION_ACTION_TO_REQUIRED_NETWORK[bridgeSelection][bridgeAction]);
      if(
        BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.bridgeAddress &&
        BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.origin &&
        BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.destination &&
        BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.originAssetAddress &&
        BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.destinationAssetAddress
      ) {
        setBridgeAddress(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.bridgeAddress);
        setOriginNetwork(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.origin);
        setOriginAssetAddress(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.originAssetAddress);
        setOriginAssetDecimals(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.originAssetDecimals);
        setDestinationNetwork(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.destination);
        setDestinationAssetAddress(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.destinationAssetAddress);
        setDestinationAssetDecimals(BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK[bridgeSelection]?.destinationAssetDecimals);
      } else {
        setBridgeAddress(false);
        setOriginNetwork(false);
        setOriginAssetAddress(false);
        setOriginAssetDecimals(false);
        setDestinationNetwork(false);
        setDestinationAssetAddress(false);
        setDestinationAssetDecimals(false);
      }
    } else {
      setRequiredNetwork(false);
      setBridgeAddress(false);
      setOriginNetwork(false);
      setOriginAssetAddress(false);
      setOriginAssetDecimals(false);
      setDestinationNetwork(false);
      setDestinationAssetAddress(false);
      setDestinationAssetDecimals(false);
    }
  }, [bridgeSelection, bridgeAction])

  return (
    <GenericPageContainer>
      {requiredNetwork &&
        <>
          <NetworkGateContainer
            requiredNetwork={requiredNetwork}
            requireConnected={true}
          >
            <>
              {
                bridgeAddress &&
                originNetwork &&
                destinationNetwork &&
                originAssetAddress &&
                originAssetDecimals &&
                destinationAssetAddress &&
                destinationAssetDecimals &&
                bridgeSelection &&
                bridgeAction &&
                transactionHash &&
                <>
                  {bridgeAction === 'prove-withdrawal' &&
                    <BridgeProveWithdrawalFormContainer 
                      origin={originNetwork}
                      destination={destinationNetwork}
                      transactionHash={transactionHash as `0x${string}`}
                    />
                  }
                  {bridgeAction === 'finalize-withdrawal' &&
                    <BridgeFinalizeWithdrawalFormContainer 
                      origin={originNetwork}
                      destination={destinationNetwork}
                      transactionHash={transactionHash as `0x${string}`}
                    />
                  }
                </>
              }
            </>
          </NetworkGateContainer>
        </>
      }
    </GenericPageContainer>
  )
};

export default BridgeTransactionActionPage;