import React from 'react';

import {
  // HOME_ADDRESS_NFT_STAKING_CONTRACT_ADDRESS,
  HOME_ADDRESS_NFT_STAKING_CONTRACT_NETWORK,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';

const StakingPage = () => {
    return (
      <GenericPageContainer>
        <NetworkGateContainer
          requiredNetwork={HOME_ADDRESS_NFT_STAKING_CONTRACT_NETWORK}
          onlyGateConnected={true}
        >
          <h1>Passed Network Gate</h1>
        </NetworkGateContainer>
      </GenericPageContainer>
    )
};

export default StakingPage;