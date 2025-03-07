import React from 'react';

import NetworkGateContainer from '../containers/NetworkGateContainer';
import FloatingActionButton from '../components/FloatingActionButton';

import { useAppKit } from '@reown/appkit/react'

const PaymasterTestUnifiedPage = () => {

  const { open } = useAppKit();
 
  return (
    <NetworkGateContainer
      requiredNetwork={"base"}
      requireConnected={true}
    >
      <div style={{padding: 32, width: '100%'}}>
        <h2>Buy Crypto Testing</h2>
        <FloatingActionButton
          buttonColor="secondary"
          onClick={() => open({ view: 'OnRampProviders' })}
          text={"Buy Crypto"}
        />
      </div>
    </NetworkGateContainer>
  );
};

export default PaymasterTestUnifiedPage;