import React from 'react';

import { useParams } from 'react-router-dom';

import PropyKeyRepossessionContainer from '../containers/PropyKeyRepossessionContainer';

import NetworkGateContainer from '../containers/NetworkGateContainer';

import {
  BASE_L2_NETWORK,
} from '../utils/constants';

const PropyKeyRepossessionPage = () => {

    let { 
      propyKeyTokenId,
    } = useParams();

    return (
      <>
        <NetworkGateContainer
          requiredNetwork={BASE_L2_NETWORK}
          requireConnected={true}
        >
          <PropyKeyRepossessionContainer propyKeyTokenId={propyKeyTokenId} />
        </NetworkGateContainer>
      </>
    )
};

export default PropyKeyRepossessionPage;