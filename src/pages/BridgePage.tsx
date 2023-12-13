import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';

import { SupportedNetworks } from '../interfaces';

import {
  BRIDGE_SELECTION_TO_REQUIRED_NETWORK,
  BRIDGE_SELECTION_TO_ORIGIN_AND_DESTINATION_NETWORK,
} from '../utils/constants'
import BridgeFormContainer from '../containers/BridgeFormContainer';

const BridgePage = () => {

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
                  <BridgeFormContainer 
                    bridgeAddress={bridgeAddress}
                    origin={originNetwork}
                    originAssetAddress={originAssetAddress}
                    originAssetDecimals={originAssetDecimals}
                    destination={destinationNetwork}
                    destinationAssetAddress={destinationAssetAddress}
                    destinationAssetDecimals={destinationAssetDecimals}
                  />
              }
            </>
          </NetworkGateContainer>
        </>
      }
    </GenericPageContainer>
  )
};

export default BridgePage;