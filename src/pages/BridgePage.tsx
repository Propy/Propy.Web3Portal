import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';

import { SupportedNetworks } from '../interfaces';

import {
  BRIDGE_SELECTION_TO_REQUIRED_NETWORK,
  BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK,
  PRO_ETHEREUM_L1_ADDRESS,
  PRO_BASE_L2_ADDRESS,
  BASE_BRIDGE_L1_NETWORK,
  BASE_BRIDGE_L2_NETWORK,
  BASE_BRIDGE_L2_NETWORKS,
} from '../utils/constants';

import BridgeFormContainer from '../containers/BridgeFormContainer';
import BridgeTransactionHistoryContainer from '../containers/BridgeTransactionHistoryContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sectionSpacerTop: {
      marginTop: theme.spacing(4),
    },
  }),
);

const BridgePage = () => {

  const classes = useStyles();

  let { 
    bridgeSelection,
  } = useParams();

  const [requiredNetwork, setRequiredNetwork] = useState<false | SupportedNetworks>(false);
  const [bridgeAddress, setBridgeAddress] = useState<false | `0x${string}`>(false);
  const [originNetwork, setOriginNetwork] = useState<false | SupportedNetworks>(false);
  const [destinationNetwork, setDestinationNetwork] = useState<false | SupportedNetworks>(false);
  const [originAssetAddress, setOriginAssetAddress] = useState<false | `0x${string}`>(false);
  const [originAssetDecimals, setOriginAssetDecimals] = useState<false | number>(false);
  const [destinationAssetAddress, setDestinationAssetAddress] = useState<false | `0x${string}`>(false);
  const [destinationAssetDecimals, setDestinationAssetDecimals] = useState<false | number>(false);
  const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);

  useEffect(() => {
    if(bridgeSelection && BRIDGE_SELECTION_TO_REQUIRED_NETWORK[bridgeSelection]) {
      setRequiredNetwork(BRIDGE_SELECTION_TO_REQUIRED_NETWORK[bridgeSelection]);
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
  }, [bridgeSelection])

  const postBridgeSuccess = useCallback(() => {
    setTriggerUpdateIndex(prevIndex => prevIndex + 1);
  }, []);

  return (
    <>
      {requiredNetwork &&
        <>
          <NetworkGateContainer
            requiredNetwork={requiredNetwork}
            requireConnected={true}
          >
            <GenericPageContainer>
              <>
                {
                  bridgeSelection &&
                  bridgeAddress &&
                  originNetwork &&
                  destinationNetwork &&
                  originAssetAddress &&
                  originAssetDecimals &&
                  destinationAssetAddress &&
                  destinationAssetDecimals &&
                    <>
                      <BridgeFormContainer 
                        bridgeAddress={bridgeAddress}
                        origin={originNetwork}
                        originAssetAddress={originAssetAddress}
                        originAssetDecimals={originAssetDecimals}
                        destination={destinationNetwork}
                        destinationAssetAddress={destinationAssetAddress}
                        destinationAssetDecimals={destinationAssetDecimals}
                        postBridgeSuccess={postBridgeSuccess}
                      />
                      {/* Temp only render on withdrawals section until deposits are supported */}
                      <div className={classes.sectionSpacerTop}>
                        <BridgeTransactionHistoryContainer
                          mode={BASE_BRIDGE_L2_NETWORKS.indexOf(originNetwork) > -1 ? 'withdrawals' : 'deposits'}
                          l1Network={BASE_BRIDGE_L1_NETWORK}
                          l2Network={BASE_BRIDGE_L2_NETWORK}
                          l1TokenAddress={PRO_ETHEREUM_L1_ADDRESS}
                          l2TokenAddress={PRO_BASE_L2_ADDRESS}
                          triggerUpdateIndex={triggerUpdateIndex}
                        />
                      </div>
                    </>
                }
              </>
            </GenericPageContainer>
          </NetworkGateContainer>
        </>
      }
    </>
  )
};

export default BridgePage;