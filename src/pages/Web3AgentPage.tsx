import React from 'react';

import {
  WEB3_AGENT_NETWORKS,
} from '../utils/constants';

import NetworkGateContainer from '../containers/NetworkGateContainer';
import AgentApiConfigGateContainer from '../containers/AgentApiConfigGateContainer';
import ChatInterfaceContainer from '../containers/ChatInterfaceContainer';

const Web3AgentPage = () => {
  return (
    <NetworkGateContainer
      requiredNetworks={WEB3_AGENT_NETWORKS}
      requireConnected={true}
    >
      <AgentApiConfigGateContainer>
        <ChatInterfaceContainer />
      </AgentApiConfigGateContainer>
    </NetworkGateContainer>
  )
};

export default Web3AgentPage;